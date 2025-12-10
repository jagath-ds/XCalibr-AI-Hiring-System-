# routers/analysis.py

import os
import json
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from ai_services import analyzer_service, jd_matching_service, utils

router = APIRouter(prefix="/analysis", tags=["Analysis"])

UPLOAD_DIRECTORY = "static/resumes"


#  ENDPOINT FOR "RETRY" BUTTON 
@router.post("/retry/{application_id}", status_code=status.HTTP_202_ACCEPTED)
async def retry_failed_analysis(
    application_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Triggers a new background analysis for an existing application
    using the CV *already stored* for that application.
    This is for retrying "Failed" or "Pending" jobs.
    """
    
    # 1. Finding the application
    application = db.query(models.Application).filter(
        models.Application.application_id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # 2. Find the associated analysis report
    analysis = db.query(models.Analysis).filter(
        models.Analysis.application_id == application_id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report not found for this application")

    # 3. Check if the CV path exists
    if not application.cv_path or not os.path.exists(application.cv_path):
        raise HTTPException(
            status_code=400,
            detail=f"CV file not found at path: {application.cv_path}. Cannot retry analysis."
        )

    try:
        # 4. Update status to "Pending" to show it's working
        analysis.analysis_status = "Pending"
        analysis.remarks = '{"status": "Retrying analysis..."}' 
        analysis.overall_score = None 
        db.commit()

        # 5. Add the background task
        background_tasks.add_task(
            analyzer_service.run_automatic_analysis,
            application_id=application.application_id,
            cv_path=application.cv_path  
        )
        
        return {"message": f"Analysis for application {application_id} has been successfully retried."}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")



@router.post("/rerun/{application_id}", status_code=202)
async def rerun_analysis_with_new_cv(
    application_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Triggers a new background analysis for an existing application
    using a newly uploaded CV.
    """
    application = db.query(models.Application).filter(
        models.Application.application_id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or file has no name.")

    # Save the new CV
    if not os.path.exists(UPLOAD_DIRECTORY):
        os.makedirs(UPLOAD_DIRECTORY)
        
    # Use a unique name for the new CV
    file_path = os.path.join(UPLOAD_DIRECTORY, f"rerun_{application_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        
        application.cv_path = file_path 
            
        
        analysis = db.query(models.Analysis).filter(
            models.Analysis.application_id == application_id
        ).first()
        
        if analysis:
            analysis.analysis_status = "Pending"
            analysis.remarks = '{"status": "Re-running with new CV..."}' 
            analysis.overall_score = None 
            db.commit()
        else:
            
            db.rollback()
            raise HTTPException(status_code=404, detail="Analysis report not found for this application")

        # Add the background task i.e analysis 
        background_tasks.add_task(
            analyzer_service.run_automatic_analysis,
            application_id=application.application_id,
            cv_path=file_path  
        )
        
        return {"message": "Analysis re-run has been triggered with the new CV."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")




@router.post("/analyze_cv/", response_model=schemas.AnalysisRead)
async def analyze_candidate_cv_and_save(
    candid: int = Form(...),
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
     Manually runs analysis for a candidate FOR A SPECIFIC JOB
    they have already applied to. This is a synchronous (slow) endpoint.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or file has no name.")

    application = db.query(models.Application).filter(
        models.Application.candid == candid,
        models.Application.job_id == job_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404, 
            detail="Application not found. Candidate must apply for this job before a manual analysis can be run."
        )

    if not os.path.exists(UPLOAD_DIRECTORY):
        os.makedirs(UPLOAD_DIRECTORY)

    file_path = os.path.join(UPLOAD_DIRECTORY, f"{application.application_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        new_analysis = analyzer_service.analyze_full_candidate_profile(
            application_id=application.application_id,
            candid=candid,
            cv_file_path=file_path,
            db=db,
            job_id=job_id
        )
        return new_analysis

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/match_cv_to_jd/")
async def match_cv_to_job_description(
    job_description: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Performs a real-time analysis and matching between a CV and a job
    description without saving the results to the database.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or file has no name.")

    if not os.path.exists(UPLOAD_DIRECTORY):
        os.makedirs(UPLOAD_DIRECTORY)

    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        cv_content = utils.read_cv(file_path)
        cv_analysis_result = analyzer_service._analyze_cv_text(cv_content)
        jd_analysis_result = jd_matching_service.analyze_job_description(job_description)

        match_result = jd_matching_service.get_match_analysis(
            cv_analysis=cv_analysis_result,
            jd_analysis=jd_analysis_result
        )

        return {
            "match_result": match_result,
            "candidate_analysis": cv_analysis_result,
            "job_description_analysis": jd_analysis_result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.get("/", response_model=List[schemas.AnalysisRead])
def get_all_analysis(db: Session = Depends(get_db)):
    """
    Retrieves all analysis reports from the database.
    """
    return db.query(models.Analysis).all()


@router.get("/{candid}", response_model=schemas.AnalysisRead)
def get_analysis_by_candidate(candid: int, db: Session = Depends(get_db)):
    """
    Retrieves the analysis for a specific candidate by their ID.
    """
    analysis = db.query(models.Analysis).filter(models.Analysis.candid == candid).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this candidate")
    return analysis