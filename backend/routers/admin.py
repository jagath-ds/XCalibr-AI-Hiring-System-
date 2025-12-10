# routers/admin.py

from fastapi import APIRouter, Depends, HTTPException, status, Request  
from sqlalchemy.orm import Session, joinedload  
from sqlalchemy import func
from typing import List  
from database import get_db
import models, schemas, auth
from security import verify_password
from security import get_password_hash

from logging_utils import log_admin_action

router = APIRouter(tags=["Admin"])


@router.post("/login", response_model=schemas.Token)
def login_admin(
    admin_data: schemas.AdminLoginRequest,
    request: Request,  
    db: Session = Depends(get_db)
):
    """
    Logs in an Admin and returns a JWT token.
    """
    admin = db.query(models.Admin).filter(models.Admin.email == admin_data.email).first()
    
    if not admin or not verify_password(admin_data.password, admin.pass_word):
        # --- Log failed login attempt ---
        log_admin_action(
            db=db,
            admin=admin,  
            request=request,
            actiontype="LOGIN",
            actiondescription=f"Failed login attempt for email: {admin_data.email}",
            affectedtable="admin",
            status="Failure"
        )
        db.commit() # Commit the failure log
        
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # --- Log successful login ---
    log_admin_action(
        db=db,
        admin=admin,
        request=request,
        actiontype="LOGIN",
        actiondescription="Admin successfully logged in.",
        affectedtable="admin",
        status="Success"
    )
    db.commit() # Commit the success log
    
    
    access_token = auth.create_access_token(
        data={"sub": str(admin.adminid), "role": "admin"}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.AdminRead)
def get_current_admin_me(
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Returns the profile of the currently logged-in admin.
    """
    return current_admin


# --- User Management Routes ---

@router.get("/candidates", response_model=List[schemas.CandidateRead])
def get_all_candidates_admin(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Retrieves a list of all candidates (Admin Use).
    (Moved from candidates.py)
    """
    results = db.query(
        models.Candidates,
        func.count(models.Application.application_id).label("applications_count")
    ).outerjoin(
        models.Application, models.Candidates.candid == models.Application.candid
    ).group_by(
        models.Candidates.candid
    ).order_by(
        models.Candidates.candid
    ).all()

    candidates_with_counts = []
    for candidate, count in results:
        candidate_data = schemas.CandidateRead.model_validate(candidate)
        candidate_data.applications_count = count
        candidates_with_counts.append(candidate_data)

    return candidates_with_counts


@router.get("/candidates/{candidate_id}", response_model=schemas.CandidateRead)
def get_candidate_by_id_admin(
    candidate_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Retrieves a single candidate by their ID (Admin Use).
    (Moved from candidates.py)
    """
    result = db.query(
        models.Candidates,
        func.count(models.Application.application_id).label("applications_count")
    ).outerjoin(
        models.Application, models.Candidates.candid == models.Application.candid
    ).filter(
        models.Candidates.candid == candidate_id
    ).group_by(
        models.Candidates.candid
    ).first()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Candidate with id {candidate_id} not found")

    candidate, count = result
    # Use .model_validate() for Pydantic v2
    candidate_data = schemas.CandidateRead.model_validate(candidate)
    candidate_data.applications_count = count
    return candidate_data


@router.post("/candidates/{candidate_id}/suspend", response_model=schemas.CandidateRead)
def suspend_candidate(
    candidate_id: int,
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Suspends (deactivates) a candidate account.
    """
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    try:
        candidate.is_active = False
        db.add(candidate)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Suspended Candidate: {candidate.email} (ID: {candidate.candid})",
            affectedtable="candidates"
        )
    
        
        db.commit()
        db.refresh(candidate)
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Failed to suspend Candidate: {candidate.email}. Error: {str(e)}",
            affectedtable="candidates",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not suspend candidate.")

    candidate_data = schemas.CandidateRead.model_validate(candidate)
    candidate_data.applications_count = db.query(models.Application).filter(models.Application.candid == candidate_id).count()
    return candidate_data


@router.post("/candidates/{candidate_id}/activate", response_model=schemas.CandidateRead)
def activate_candidate(
    candidate_id: int,
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Activates a suspended candidate account.
    """
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    try:
        candidate.is_active = True
        db.add(candidate)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Activated Candidate: {candidate.email} (ID: {candidate.candid})",
            affectedtable="candidates"
        )
        # --- End Log ---
        
        db.commit()
        db.refresh(candidate)
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Failed to activate Candidate: {candidate.email}. Error: {str(e)}",
            affectedtable="candidates",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not activate candidate.")

    candidate_data = schemas.CandidateRead.model_validate(candidate)
    candidate_data.applications_count = db.query(models.Application).filter(models.Application.candid == candidate_id).count()
    return candidate_data


@router.get("/hr", response_model=List[schemas.HrRead])
def get_all_hr_admin(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Retrieves a list of all HR users (Admin Use).
    """
    hr_users = db.query(models.Hr).all()
    return hr_users


@router.post("/hr/{hr_id}/suspend", response_model=schemas.HrRead)
def suspend_hr(
    hr_id: int,
    request: Request, # <-- Added Request
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Suspends (deactivates) an HR account.
    """
    hr_user = db.query(models.Hr).filter(models.Hr.hr_id == hr_id).first()
    if not hr_user:
        raise HTTPException(status_code=404, detail="HR user not found")
    
    try:
        hr_user.is_active = False
        db.add(hr_user)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Suspended HR User: {hr_user.email} (ID: {hr_user.hr_id})",
            affectedtable="hr"
        )
        # --- End Log ---
        
        db.commit()
        db.refresh(hr_user)
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Failed to suspend HR User: {hr_user.email}. Error: {str(e)}",
            affectedtable="hr",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not suspend HR user.")
        
    return hr_user


@router.post("/hr/{hr_id}/activate", response_model=schemas.HrRead)
def activate_hr(
    hr_id: int,
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Activates a suspended HR account.
    """
    hr_user = db.query(models.Hr).filter(models.Hr.hr_id == hr_id).first()
    if not hr_user:
        raise HTTPException(status_code=404, detail="HR user not found")
    
    try:
        hr_user.is_active = True
        db.add(hr_user)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Activated HR User: {hr_user.email} (ID: {hr_user.hr_id})",
            affectedtable="hr"
        )
        # --- End Log ---
        
        db.commit()
        db.refresh(hr_user)

    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Failed to activate HR User: {hr_user.email}. Error: {str(e)}",
            affectedtable="hr",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not activate HR user.")

    return hr_user

@router.delete("/hr/{hr_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hr_account(
    hr_id: int,
    request: Request, # <-- Added Request
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Permanently deletes an HR user account. (Admin Protected)
    """
    hr_user = db.query(models.Hr).filter(models.Hr.hr_id == hr_id).first()
    if not hr_user:
        raise HTTPException(status_code=404, detail="HR user not found")
    
    # Store email for logging before it's deleted
    hr_email = hr_user.email
    
    try:
        db.delete(hr_user)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="DELETE",
            actiondescription=f"Deleted HR User: {hr_email} (ID: {hr_id})",
            affectedtable="hr"
        )
        # --- End Log ---
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="DELETE",
            actiondescription=f"Failed to delete HR User: {hr_email}. Error: {str(e)}",
            affectedtable="hr",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not delete HR user.")
        
    return None


@router.delete("/candidates/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate_account(
    candidate_id: int,
    request: Request, # <-- Added Request
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Permanently deletes a candidate account. (Admin Protected)
    """
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Store email for logging before it's deleted
    candidate_email = candidate.email

    try:
        db.delete(candidate)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="DELETE",
            actiondescription=f"Deleted Candidate: {candidate_email} (ID: {candidate_id})",
            affectedtable="candidates"
        )
        # --- End Log ---
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="DELETE",
            actiondescription=f"Failed to delete Candidate: {candidate_email}. Error: {str(e)}",
            affectedtable="candidates",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not delete candidate.")
        
    return None


# --- Password Reset Endpoints ---

@router.put("/hr/{hr_id}/reset-password", response_model=schemas.MessageResponse)
def reset_hr_password(
    hr_id: int,
    password_data: schemas.PasswordResetRequest,
    request: Request, # <-- Added Request
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Resets an HR user's password (Admin only).
    """
    hr_user = db.query(models.Hr).filter(models.Hr.hr_id == hr_id).first()
    if not hr_user:
        raise HTTPException(status_code=404, detail="HR user not found")
        
    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    try:
        hashed_password = get_password_hash(password_data.new_password)
        hr_user.pass_word = hashed_password
        db.add(hr_user)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Reset password for HR User: {hr_user.email} (ID: {hr_user.hr_id})",
            affectedtable="hr"
        )
        # --- End Log ---
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Failed to reset password for HR User: {hr_user.email}. Error: {str(e)}",
            affectedtable="hr",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not reset HR password.")
    
    return {"message": "HR user password updated successfully"}


@router.put("/candidates/{candidate_id}/reset-password", response_model=schemas.MessageResponse)
def reset_candidate_password(
    candidate_id: int,
    password_data: schemas.PasswordResetRequest,
    request: Request, # <-- Added Request
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """
    Resets a Candidate's password (Admin only).
    """
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    try:
        hashed_password = get_password_hash(password_data.new_password)
        candidate.pass_word = hashed_password
        db.add(candidate)
        
        # --- Log Action ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Reset password for Candidate: {candidate.email} (ID: {candidate.candid})",
            affectedtable="candidates"
        )
        # --- End Log ---
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        # --- Log Failure ---
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="UPDATE",
            actiondescription=f"Failed to reset password for Candidate: {candidate.email}. Error: {str(e)}",
            affectedtable="candidates",
            status="Failure"
        )
        db.commit()
        # --- End Log ---
        raise HTTPException(status_code=500, detail="Could not reset candidate password.")
        
    return {"message": "Candidate password updated successfully"}


# --- 6. NEW ENDPOINT TO FETCH SYSTEM LOGS ---

@router.get(
    "/system-logs",
    response_model=List[schemas.SystemLogResponse] 
)
def get_system_logs(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin), # Protected
    skip: int = 0,
    limit: int = 100 
):
    """
    Get all system logs. Protected for Super Admins.
    """
    logs = (
        db.query(models.SystemLog)
        .options(joinedload(models.SystemLog.admin)) 
        .order_by(models.SystemLog.timestamped.desc()) 
        .offset(skip)
        .limit(limit)
        .all()
    )
    return logs