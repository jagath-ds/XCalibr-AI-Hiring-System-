from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List,Optional
from database import get_db
import models, schemas

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Create job
@router.post("/", response_model=schemas.JobPostingRead)
def create_job(job: schemas.JobPostingCreate, db: Session = Depends(get_db)):
    new_job = models.JobPosting(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# Get jobs 
@router.get("/", response_model=List[schemas.JobPostingRead])
def get_jobs(hr_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.JobPosting)
    if hr_id:
        query = query.filter(models.JobPosting.hr_id == hr_id)
    return query.all()

# Get job by ID
@router.get("/{job_id}", response_model=schemas.JobPostingRead)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Update job
@router.put("/{job_id}", response_model=schemas.JobPostingRead)
def update_job(job_id: int, job: schemas.JobPostingCreate, db: Session = Depends(get_db)):
    db_job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in job.dict(exclude_unset=True).items():
        setattr(db_job, key, value)
    db.commit()
    db.refresh(db_job)
    return db_job

# Delete job
@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(db_job)
    db.commit()
    return {"detail": "Job deleted"}
