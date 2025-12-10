# routers/hr.py

from fastapi import APIRouter, Depends, HTTPException, status, Request  # Added Request
from sqlalchemy.orm import Session, joinedload, Query
from database import get_db
import models, schemas, auth 
from security import get_password_hash, verify_password
from sqlalchemy import desc, func, distinct, and_
from typing import List
from datetime import datetime, timedelta, date


try:
    from logging_utils import log_admin_action
except ImportError:
    print("WARNING: 'log_admin_action' utility not found. Admin logging will be disabled.")
    def log_admin_action(*args, **kwargs):
        pass

router = APIRouter(prefix="/hr", tags=["HR"])

# ========================================
# === HR User Management Endpoints ===
# ========================================

@router.post("/", response_model=schemas.HrRead, status_code=status.HTTP_201_CREATED)
def create_hr(
    hr: schemas.HrCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Creates a new HR user, protected by Admin authentication."""
    
    # --- 1. Validation ---
    existing_hr = db.query(models.Hr).filter(models.Hr.email == hr.email).first()
    if existing_hr:
        # Log the failed attempt before raising
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="Create HR",
            actiondescription=f"Failed attempt to create HR: Email '{hr.email}' already registered.",
            affectedtable="hr",
            status="Failed"
        )
        db.commit() # Commit the failure log
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # --- 2. Main Action & Logging (Transaction) ---
    try:
        hashed_password = get_password_hash(hr.pass_word)
        
        new_hr = models.Hr(
            firstname=hr.firstname, lastname=hr.lastname, email=hr.email,
            pass_word=hashed_password, designation=hr.designation, permissions=hr.permissions
        )
        db.add(new_hr)
        
        # Flush to get the new_hr.hr_id for the log description
        db.flush() 
        
        # Log the successful action
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="Create HR",
            actiondescription=f"Admin created new HR user: {new_hr.email} (ID: {new_hr.hr_id})",
            affectedtable="hr",
            status="Success"
        )
        
        # Commit both the new_hr and the log entry together
        db.commit()
        
    except Exception as e:
        db.rollback()
        # Note: We can't log this to the DB as the transaction failed.
        print(f"CRITICAL: Failed to commit new HR or log: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create HR account.")

    db.refresh(new_hr)
    return new_hr


@router.post("/login", response_model=schemas.Token)
def login_hr(hr_data: schemas.HrLogin, db: Session = Depends(get_db)):
    """Authenticates an HR user, checks if active, and returns a JWT token."""
    hr = db.query(models.Hr).filter(models.Hr.email == hr_data.email).first()
    
    if not hr or not verify_password(hr_data.pass_word, hr.pass_word):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    if not hr.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact admin."
        )
    
    access_token = auth.create_access_token(
        data={"sub": str(hr.hr_id), "role": "hr"}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.HrRead)
def get_current_hr_me(
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    """Retrieves the profile for the currently logged-in HR user."""
    
    return current_hr

@router.get("/{hr_id}", response_model=schemas.HrRead)
def get_hr_by_id(
    hr_id: int, 
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Retrieves a single HR user's profile by their ID (Admin Protected)."""
    
    hr_user = db.query(models.Hr).filter(models.Hr.hr_id == hr_id).first()
    
    if not hr_user:
        # Log the failed read attempt
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="View HR Profile",
            actiondescription=f"Failed attempt to view profile for non-existent HR ID: {hr_id}",
            affectedtable="hr",
            status="Failed"
        )
        db.commit() # Commit the log
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"HR user with id {hr_id} not found")
    
    # Log the successful read action
    log_admin_action(
        db=db,
        admin=current_admin,
        request=request,
        actiontype="View HR Profile",
        actiondescription=f"Admin viewed profile for: {hr_user.email} (ID: {hr_id})",
        affectedtable="hr",
        status="Success"
    )
    db.commit() # Commit the log
    
    return hr_user


@router.put("/{hr_id}/profile", response_model=schemas.HrRead)
def update_hr_profile(
    hr_id: int, 
    profile_data: schemas.HrUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Hr = Depends(auth.get_current_hr)
):
    """Updates the HR user's own profile information."""
    if current_user.hr_id != hr_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own profile.")

    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/{hr_id}/change-password")
def change_hr_password(
    hr_id: int, 
    passwords: schemas.HrPasswordUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Hr = Depends(auth.get_current_hr)
):
    """Changes an HR user's password after verifying their current password."""
    # (No admin logging needed here)
    if current_user.hr_id != hr_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only change your own password.")

    if not verify_password(passwords.current_password, current_user.pass_word):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")

    current_user.pass_word = get_password_hash(passwords.new_password)
    db.commit()
    return {"detail": "Password updated successfully"}


@router.delete("/{hr_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hr(
    hr_id: int, 
    request: Request, # Added Request
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Deletes an HR user from the database (Admin Protected)."""
    
    hr_user = db.query(models.Hr).filter(models.Hr.hr_id == hr_id).first()
    
    if not hr_user:
        # Log the failed attempt
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="Delete HR",
            actiondescription=f"Failed attempt to delete non-existent HR ID: {hr_id}",
            affectedtable="hr",
            status="Failed"
        )
        db.commit() # Commit the log
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="HR user not found")
    
    # Store email for logging before it's deleted
    hr_email = hr_user.email
    
    try:
        db.delete(hr_user)
        
        # Log the successful deletion
        log_admin_action(
            db=db,
            admin=current_admin,
            request=request,
            actiontype="Delete HR",
            actiondescription=f"Admin deleted HR user: {hr_email} (ID: {hr_id})",
            affectedtable="hr",
            status="Success"
        )
        
        # Commit both the deletion and the log
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"CRITICAL: Failed to commit HR deletion or log: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete HR account.")

    return None


# ========================================================
# === Job & Application Management Endpoints for HR ===
# ========================================================

@router.get("/{hr_id}/jobs", response_model=list[schemas.JobPostingRead])
def get_jobs_by_hr(
    hr_id: int, 
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    if current_hr.hr_id != hr_id:
        raise HTTPException(status_code=403, detail="You can only view your own jobs.")
    
    jobs = db.query(models.JobPosting).filter(models.JobPosting.hr_id == hr_id).all()
    return jobs


@router.get("/jobs/{job_id}/applications", response_model=list[schemas.ApplicationRead])
def get_applications_by_job(
    job_id: int, 
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.hr_id != current_hr.hr_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view applications for this job.")

    applications = (
        db.query(models.Application)
        .options(
            joinedload(models.Application.candidate),
            joinedload(models.Application.job)
        )
        .filter(models.Application.job_id == job_id)
        .all()
    )
    return applications

# ==========================================================
# === Feedback & Candidate Listing Endpoints ===
# ==========================================================

@router.post("/feedback", response_model=schemas.FeedbackRead, status_code=status.HTTP_201_CREATED)
def create_feedback_for_candidate(
    feedback: schemas.FeedbackCreateByHR, 
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    candidate = db.query(models.Candidates).filter(
        models.Candidates.candid == feedback.candid
    ).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Candidate with id {feedback.candid} not found"
        )
        
    if feedback.reportid:
        report = db.query(models.Analysis).filter(
            models.Analysis.reportid == feedback.reportid
        ).first()
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Analysis report with id {feedback.reportid} not found"
            )
        job_posted_by_hr = db.query(models.JobPosting).filter(
            models.JobPosting.job_id == report.job_id,
            models.JobPosting.hr_id == current_hr.hr_id
        ).first()
        
        if not job_posted_by_hr:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only send feedback using reports for jobs you posted."
            )
        if report.candid != feedback.candid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Report id does not belong to the specified candidate."
            )

    if feedback.message_type == "General" and feedback.reportid is not None:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="General messages cannot be associated with a report ID."
        )
        
    db_feedback = models.Feedback(
        candid=feedback.candid,
        hr_id=current_hr.hr_id,
        reportid=feedback.reportid,
        content=feedback.content,
        message_type=feedback.message_type
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)

    final_feedback = db.query(models.Feedback).options(
        joinedload(models.Feedback.cand),
        joinedload(models.Feedback.report),
        joinedload(models.Feedback.sender)
    ).filter(models.Feedback.feedbackid == db_feedback.feedbackid).first()

    return final_feedback


@router.get("/my-applicants/reports/{candid}", response_model=List[schemas.AnalysisRead])
def get_available_reports_for_candidate(
    candid: int,
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    reports = db.query(models.Analysis).options(
        joinedload(models.Analysis.job)
    ).filter(
        models.Analysis.candid == candid,
        models.Analysis.job_id.in_(
            db.query(models.JobPosting.job_id).filter(models.JobPosting.hr_id == current_hr.hr_id)
        ),
        models.Analysis.analysis_status == "Completed"
    ).order_by(
        desc(models.Analysis.analyzed_at)
    ).all()
    
    return reports


@router.get("/my-applicants/list", response_model=List[schemas.CandidateSimpleRead])
def get_all_applicants_for_hr(
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    hr_id = current_hr.hr_id
    
    hr_job_ids = db.query(models.JobPosting.job_id).filter(
        models.JobPosting.hr_id == hr_id
    ).all()
    
    job_id_list = [job_id for (job_id,) in hr_job_ids]
    
    if not job_id_list:
        return []

    applicants_query = (
        db.query(
            models.Candidates,
            models.Application.application_id,
            models.Application.job_id,
            models.JobPosting.title
        )
        .join(models.Application, models.Candidates.candid == models.Application.candid)
        .join(models.JobPosting, models.Application.job_id == models.JobPosting.job_id)
        .filter(models.Application.job_id.in_(job_id_list))
        .distinct(models.Candidates.candid)
        .all()
    )
    
    applicant_list = []
    for candidate, app_id, job_id, job_title in applicants_query:
        applicant_list.append(
            schemas.CandidateSimpleRead(
                candid=candidate.candid,
                firstname=candidate.firstname,
                lastname=candidate.lastname,
                email=candidate.email,
                application_id=app_id,
                job_id=job_id,
                job_title=job_title
            )
        )
        
    return applicant_list

# ========================================================
# === NEW HR DASHBOARD ENDPOINTS ===
# ========================================================

def get_hr_job_ids_subquery(hr_id: int, db: Session) -> Query:
    # (Unchanged)
    return db.query(models.JobPosting.job_id).filter(
        models.JobPosting.hr_id == hr_id
    )

@router.get("/dashboard/kpis", response_model=schemas.DashboardKPIs)
def get_hr_dashboard_kpis(
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    hr_id = current_hr.hr_id
    one_week_ago = datetime.now() - timedelta(days=7)
    
    hr_job_ids_subquery = get_hr_job_ids_subquery(hr_id, db)

    active_jobs = db.query(models.JobPosting).filter(
        models.JobPosting.hr_id == hr_id,
        models.JobPosting.status == "Active"
    ).count()

    total_applicants = db.query(models.Application).filter(
        models.Application.job_id.in_(hr_job_ids_subquery)
    ).count()

    new_applicants_weekly = db.query(models.Application).filter(
        models.Application.job_id.in_(hr_job_ids_subquery),
        models.Application.applied_on >= one_week_ago
    ).count()

    pending_analyses = db.query(models.Analysis).filter(
        models.Analysis.job_id.in_(hr_job_ids_subquery),
        models.Analysis.analysis_status.in_(["Pending", "Failed"])
    ).count()

    return schemas.DashboardKPIs(
        active_jobs=active_jobs,
        total_applicants=total_applicants,
        new_applicants_weekly=new_applicants_weekly,
        pending_analyses=pending_analyses
    )

@router.get("/dashboard/job-summaries", response_model=List[schemas.JobSummary])
def get_hr_job_summaries(
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    hr_id = current_hr.hr_id
    one_week_ago = datetime.now() - timedelta(days=7)

    total_app_sq = db.query(
        models.Application.job_id,
        func.count(models.Application.application_id).label("total_applicants")
    ).group_by(models.Application.job_id).subquery()

    new_app_sq = db.query(
        models.Application.job_id,
        func.count(models.Application.application_id).label("new_applicants")
    ).filter(
        models.Application.applied_on >= one_week_ago
    ).group_by(models.Application.job_id).subquery()

    pending_an_sq = db.query(
        models.Analysis.job_id,
        func.count(models.Analysis.reportid).label("pending_analyses")
    ).filter(
        models.Analysis.analysis_status.in_(["Pending", "Failed"])
    ).group_by(models.Analysis.job_id).subquery()

    jobs_with_counts = db.query(
        models.JobPosting,
        func.coalesce(total_app_sq.c.total_applicants, 0).label("total_applicants"),
        func.coalesce(new_app_sq.c.new_applicants, 0).label("new_applicants"),
        func.coalesce(pending_an_sq.c.pending_analyses, 0).label("pending_analyses")
    ).outerjoin(
        total_app_sq, models.JobPosting.job_id == total_app_sq.c.job_id
    ).outerjoin(
        new_app_sq, models.JobPosting.job_id == new_app_sq.c.job_id
    ).outerjoin(
        pending_an_sq, models.JobPosting.job_id == pending_an_sq.c.job_id
    ).filter(
        models.JobPosting.hr_id == hr_id
    ).order_by(
        desc(models.JobPosting.date_posted)
    ).all()

    summaries = []
    for job, total, new, pending in jobs_with_counts:
        summaries.append(schemas.JobSummary(
            job_id=job.job_id,
            title=job.title,
            company_name=job.company_name,
            location=job.location,
            status=job.status,
            total_applicants=total,
            new_applicants=new,
            pending_analyses=pending
        ))
        
    return summaries

@router.get("/dashboard/applicant-volume", response_model=List[schemas.ApplicantVolumeData])
def get_hr_applicant_volume(
    db: Session = Depends(get_db),
    current_hr: models.Hr = Depends(auth.get_current_hr)
):
    # (Unchanged)
    from typing import Any
    
    hr_id = current_hr.hr_id
    fourteen_days_ago = date.today() - timedelta(days=13) 

    hr_job_ids_subquery = get_hr_job_ids_subquery(hr_id, db)

    volume = db.query(
        func.date(models.Application.applied_on).label("date"),
        func.count(models.Application.application_id).label("count")
    ).filter(
        models.Application.job_id.in_(hr_job_ids_subquery),
        func.date(models.Application.applied_on) >= fourteen_days_ago
    ).group_by(
        func.date(models.Application.applied_on)
    ).order_by(
        func.date(models.Application.applied_on)
    ).all()

    date_map: dict[date, int] = {}
    for item in volume:
        raw_count: Any = item.count
        
        try:
            if raw_count is None:
                final_count = 0
            elif callable(raw_count):
                final_count = 0
            else:
                final_count = int(raw_count)
        except (TypeError, ValueError):
            final_count = 0
        
        date_map[item.date] = final_count

    chart_data: list[schemas.ApplicantVolumeData] = []
    for i in range(14):
        current_date = fourteen_days_ago + timedelta(days=i)
        daily_count = date_map.get(current_date, 0)
        
        chart_data.append(schemas.ApplicantVolumeData(
            date=current_date,
            count=daily_count
        ))

    return chart_data