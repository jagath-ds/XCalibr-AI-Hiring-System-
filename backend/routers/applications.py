# In applications.py


from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks, Form
from typing import Optional # 
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models, schemas
import datetime
import auth
import os 

from ai_services import analyzer_service,utils

router = APIRouter(prefix="/applications", tags=["Applications"])

# --- 'apply_to_job' ENDPOINT ---
@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_to_job(
    background_tasks: BackgroundTasks,
    job_id: int = Form(...),
    candid: int = Form(...), # Should come from auth token ideally

    # --- CV file is now OPTIONAL ---
    cv_file: Optional[UploadFile] = File(None),

    # --- OPTIONAL: Allow candidates to update links during apply ---
    github_link_override: Optional[str] = Form(None),
    linkedin_link_override: Optional[str] = Form(None),

    db: Session = Depends(get_db)
):
    """
    Creates a new job application and triggers analysis.
    - Allows pre-filling and overrides from candidate profile.
    - Uses uploaded cv_file if provided, otherwise defaults to candidate's master resume.
    - Saves the chosen cv_path to the Application record.
    """

    # 1. Get candidate and job 
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Check for duplicate application 
    existing_application = db.query(models.Application).filter(
        models.Application.candid == candid,
        models.Application.job_id == job_id
    ).first()
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # --- 3. Determine CV Path ---
    cv_path_for_application = ""
    if cv_file and cv_file.filename:
        
        print(f"New CV uploaded for application: {cv_file.filename}")
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        
        safe_filename = f"app_{candid}_{job_id}_{timestamp}_{cv_file.filename}"
        try:
            # Save to static/resumes folder
            cv_path_for_application = utils.save_upload_file(cv_file, f"static/resumes/{safe_filename}")
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Failed to save uploaded CV: {str(e)}")
    else:
        # If User did NOT upload a new file, use master resume from profile
        print(f"No new CV uploaded. Using master resume for candidate {candid}.")
        if not candidate.resumelink:
            raise HTTPException(
                status_code=400,
                detail="No resume file was uploaded, and you do not have a master resume on your profile. Please upload one."
            )
        
        cv_path_for_application = candidate.resumelink
        #  Check if the master resume file actually exists
        if not os.path.exists(cv_path_for_application):
             print(f"Warning: Master resume file not found at path: {cv_path_for_application}")
             # Decide if this should be an error or just a warning
             raise HTTPException(status_code=404, detail=f"Your master resume file ({os.path.basename(cv_path_for_application)}) seems to be missing. Please re-upload it to your profile or upload a new one for this application.")


    # --- 4. Prepare Application Data (Including Overrides) ---
    final_github_link = github_link_override if github_link_override is not None else candidate.github_link
    final_linkedin_link = linkedin_link_override if linkedin_link_override is not None else candidate.linkedin_link
    

    # 5. Create Application & Pending Analysis
    try:
        new_application = models.Application(
            candid=candid,
            job_id=job_id,
            status="Applied",
            cv_path=cv_path_for_application, 
            
        )

        pending_analysis = models.Analysis(
            candid=candid,
            job_id=job_id,
            analysis_status="Pending",
            application=new_application 
        )

        db.add(new_application)
        db.add(pending_analysis)
        db.commit()
        db.refresh(new_application)

        # 6. Trigger Background Analysis
        background_tasks.add_task(
            analyzer_service.run_automatic_analysis,
            application_id=new_application.application_id,
            cv_path=cv_path_for_application 
        )

        return {
            "message": "Application submitted successfully. Analysis is in progress.",
            "application_id": new_application.application_id
            
        }

    except Exception as e:
        db.rollback()
        print(f"Error during application save/trigger: {e}") 
        raise HTTPException(status_code=500, detail=f"Database error occurred while saving application.")



@router.get("/candidate", response_model=list[schemas.ApplicationForCandidateRead])
def get_applications_for_current_candidate(
    db: Session = Depends(get_db),
    current_user: models.Candidates = Depends(auth.get_current_user) 
):
    """
    Get all applications for the currently logged-in candidate.
    """
    applications = db.query(models.Application).options(
        joinedload(models.Application.job) 
    ).filter(
        models.Application.candid == current_user.candid # Filters by the user from the token
    ).order_by(
        models.Application.applied_on.desc() # Show newest first
    ).all()

    return applications

@router.get("/job/{job_id}", response_model=list[schemas.ApplicationRead])
def get_job_applicants(job_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all applicants for a specific job posting.
    """
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


@router.put("/{application_id}/status", response_model=schemas.ApplicationRead)
def update_application_status(application_id: int, application_status: str, db: Session = Depends(get_db)):
    """
    Updates the status of a specific application (e.g., 'Reviewed', 'Rejected').
    """
    application = db.query(models.Application).filter(models.Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = application_status
    db.commit()
    db.refresh(application)

    return application