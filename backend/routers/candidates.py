# routers/candidates.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import shutil
import os
from sqlalchemy.orm import Session,joinedload
from sqlalchemy import func
from database import get_db
import models, schemas
from security import get_password_hash, verify_password
import auth
from typing import List

router = APIRouter(prefix="/candidates", tags=["Candidates"])

# Define directories for file uploads
RESUME_DIR = "static/resumes"
LINKEDIN_PDF_DIR = "uploaded_linkedin_pdfs"

os.makedirs(RESUME_DIR, exist_ok=True)
os.makedirs(LINKEDIN_PDF_DIR, exist_ok=True)


# ================================================
# === Candidate Auth & Profile Management ===
# ================================================

@router.post("/", response_model=schemas.CandidateRead, status_code=status.HTTP_201_CREATED)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    """
    Creates a new candidate (signup). Checks for existing email and hashes the password.
    """
    db_candidate = db.query(models.Candidates).filter(models.Candidates.email == candidate.email).first()
    if db_candidate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    hashed_password = get_password_hash(candidate.pass_word)

    new_candidate = models.Candidates(
        firstname=candidate.firstname,
        lastname=candidate.lastname,
        email=candidate.email,
        pass_word=hashed_password
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    # Use .model_validate() for Pydantic v2
    candidate_data = schemas.CandidateRead.model_validate(new_candidate)
    candidate_data.applications_count = 0
    return candidate_data


@router.post("/login", response_model=schemas.Token)
def login_candidate(candidate_data: schemas.CandidateLogin, db: Session = Depends(get_db)):
    """
    Authenticates a candidate, checks if they are active, and returns a JWT token.
    """
    db_candidate = db.query(models.Candidates).filter(models.Candidates.email == candidate_data.email).first()

    if not db_candidate or not verify_password(candidate_data.pass_word, db_candidate.pass_word):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


    if not db_candidate.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact support."
        )
    access_token = auth.create_access_token(
        data={"sub": str(db_candidate.candid), "role": "candidate"}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.CandidateRead)
def get_current_candidate(
    current_user: models.Candidates = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the profile information for the currently authenticated candidate.
    """
    application_count = db.query(models.Application).filter(models.Application.candid == current_user.candid).count()

    candidate_data = schemas.CandidateRead.model_validate(current_user)
    candidate_data.applications_count = application_count

    return candidate_data


@router.put("/profile", response_model=schemas.CandidateRead)
def update_current_candidate_profile(
    profile_data: schemas.CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user)
):
    """
    Updates the profile of the currently authenticated candidate.
    """
    candidate = current_user
    update_data = profile_data.model_dump(exclude_unset=True)

    new_email = update_data.get("email")
    if new_email and new_email != candidate.email:
        existing_candidate_with_email = db.query(models.Candidates).filter(
            models.Candidates.email == new_email,
            models.Candidates.candid != candidate.candid
        ).first()
        if existing_candidate_with_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email address is already registered to another account."
            )

    for key, value in update_data.items():
        if hasattr(candidate, key):
            setattr(candidate, key, value)
        else:
            print(f"Warning: Received unexpected field '{key}' during profile update.")

    try:
        db.commit()
        db.refresh(candidate)
    except Exception as e:
        db.rollback()
        print(f"Database error during profile update: {e}")
        raise HTTPException(status_code=500, detail="Could not update profile due to a database error.")

    application_count = db.query(models.Application).filter(models.Application.candid == candidate.candid).count()
    candidate_data = schemas.CandidateRead.model_validate(candidate)
    candidate_data.applications_count = application_count
    return candidate_data


@router.post("/upload-resume", response_model=schemas.CandidateRead)
def upload_current_candidate_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user)
):
    """
    Handles uploading/replacing the master resume for the current candidate.
    """
    candidate = current_user
    candidate_id = candidate.candid

    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

    file_extension = os.path.splitext(file.filename)[1]
    allowed_resume_extensions = ['.pdf', '.doc', '.docx']
    if file_extension.lower() not in allowed_resume_extensions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid file type. Allowed: {', '.join(allowed_resume_extensions)}")

    safe_filename = f"candidate_{candidate_id}_resume{file_extension}"
    file_path = os.path.join(RESUME_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        print(f"Error saving resume file: {e}")
        raise HTTPException(status_code=500, detail="Could not save resume file.")
    finally:
        file.file.close()

    candidate.resumelink = file_path
    try:
        db.commit()
        db.refresh(candidate)
    except Exception as e:
        db.rollback()
        print(f"Database error updating resumelink: {e}")
        raise HTTPException(status_code=500, detail="Could not update resume link in database.")

    application_count = db.query(models.Application).filter(models.Application.candid == candidate.candid).count()
    
    candidate_data = schemas.CandidateRead.model_validate(candidate)
    candidate_data.applications_count = application_count
    return candidate_data


@router.post("/upload-linkedin-pdf", response_model=schemas.CandidateRead)
def upload_current_candidate_linkedin_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user)
):
    """
    Handles uploading/replacing the LinkedIn PDF for the current candidate.
    """
    candidate = current_user
    candidate_id = candidate.candid

    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

    file_extension = os.path.splitext(file.filename)[1]
    if file_extension.lower() != '.pdf':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Only PDF is allowed for LinkedIn profiles.")

    safe_filename = f"candidate_{candidate_id}_linkedin{file_extension}"
    file_path = os.path.join(LINKEDIN_PDF_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        print(f"Error saving LinkedIn PDF file: {e}")
        raise HTTPException(status_code=500, detail="Could not save LinkedIn PDF file.")
    finally:
        file.file.close()

    candidate.linkedin_pdf_link = file_path
    try:
        db.commit()
        db.refresh(candidate)
    except Exception as e:
        db.rollback()
        print(f"Database error updating linkedin_pdf_link: {e}")
        raise HTTPException(status_code=500, detail="Could not update LinkedIn PDF link in database.")

    application_count = db.query(models.Application).filter(models.Application.candid == candidate.candid).count()
    
    candidate_data = schemas.CandidateRead.model_validate(candidate)
    candidate_data.applications_count = application_count
    return candidate_data


@router.put("/me/change-password")
def change_current_candidate_password(
    passwords: schemas.CandidatePasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user)
):
    """
    Allows the currently authenticated candidate to change their password.
    """
    candidate = current_user

    if not verify_password(passwords.current_password, candidate.pass_word):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")

    hashed_new_password = get_password_hash(passwords.new_password)
    candidate.pass_word = hashed_new_password
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Database error changing password: {e}")
        raise HTTPException(status_code=500, detail="Could not change password due to a database error.")

    return {"detail": "Password updated successfully"}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_candidate(
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user)
):
    """
    Allows the currently authenticated candidate to delete their own account.
    """
    candidate_to_delete = current_user
    try:
        db.delete(candidate_to_delete)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Database error deleting candidate: {e}")
        raise HTTPException(status_code=500, detail="Could not delete account due to a database error.")
    
    return None

# ================================================
# === NEW: Candidate Feedback "Inbox" ===
# ================================================

@router.get("/my-feedback", response_model=List[schemas.FeedbackRead])
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user) # Protects
):
    """
    Get all feedback and messages for the currently logged-in candidate.
    This acts as their "inbox", eagerly loading the sender HR and report details.
    """
    # 1. Fetch all feedback messages for the current candidate.
    feedback_query = db.query(models.Feedback).filter(
        models.Feedback.candid == current_user.candid
    )
    
    # 2. load the sender (HR) and the linked report (Analysis).
    feedback_list = feedback_query.options(
        joinedload(models.Feedback.sender), # Loads the HR sender details
        joinedload(models.Feedback.report).joinedload(models.Analysis.job) # Loads the Analysis and its associated JobPosting
    ).order_by(models.Feedback.sent_at.desc()).all() # Show newest first
    
    return feedback_list