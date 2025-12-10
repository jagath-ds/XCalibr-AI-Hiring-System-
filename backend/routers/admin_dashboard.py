# routers/admin_dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case, select, extract
from database import get_db
import models, schemas, auth 
from typing import List, Dict, Any
from datetime import datetime, timedelta, date

router = APIRouter(prefix="/admin-dashboard", tags=["Admin Dashboard"])

def get_hr_metrics_query(db: Session):
    # Calculate Total Applicants and Pending Analyses per HR
    hr_job_metrics = (
        select(
            models.JobPosting.hr_id,
            func.count(models.Application.application_id).label('total_applicants'),
            func.sum(case((models.Analysis.analysis_status.in_(["Pending", "Processing"]), 1), else_=0)).label('pending_analyses_count')
        )
        .join(models.Application, models.JobPosting.job_id == models.Application.job_id, isouter=True)
        .join(models.Analysis, models.Application.application_id == models.Analysis.application_id, isouter=True)
        .group_by(models.JobPosting.hr_id)
        .subquery()
    )

    # Calculate Active Jobs per HR
    hr_active_jobs = (
        select(
            models.JobPosting.hr_id,
            func.count(models.JobPosting.job_id).label('active_jobs_count')
        )
        .filter(models.JobPosting.status == "Active")
        .group_by(models.JobPosting.hr_id)
        .subquery()
    )
    
    # Final query joining Hr data with aggregated metrics
    query = (
        db.query(
            models.Hr.hr_id,
            models.Hr.firstname,
            models.Hr.lastname,
            models.Hr.email,
            models.Hr.is_active,
            models.Hr.designation,
            models.Hr.permissions,
            hr_active_jobs.c.active_jobs_count,
            hr_job_metrics.c.total_applicants,
            hr_job_metrics.c.pending_analyses_count
        )
        .outerjoin(hr_active_jobs, models.Hr.hr_id == hr_active_jobs.c.hr_id)
        .outerjoin(hr_job_metrics, models.Hr.hr_id == hr_job_metrics.c.hr_id)
        .order_by(models.Hr.hr_id)
        .all()
    )
    return query


@router.get("/hr-activity", response_model=List[schemas.HrActivityRead])
def get_hr_activity_overview(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Retrieves metrics for the HR Activity Overview table (Admin Protected)."""
    
    hr_metrics_raw = get_hr_metrics_query(db)
    hr_activity_list = []
    
    for hr_id, firstname, lastname, email, is_active, designation, permissions, active_jobs, applicants, pending in hr_metrics_raw:
        hr_activity_list.append(schemas.HrActivityRead(
            hr_id=hr_id,
            firstname=firstname,
            lastname=lastname,
            email=email,
            is_active=is_active,
            designation=designation,
            permissions=permissions,
            total_active_jobs=active_jobs or 0,
            total_applicants=applicants or 0,
            pending_analyses=pending or 0
        ))
        
    return hr_activity_list


@router.get("/kpis", response_model=Dict[str, Any])
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Retrieves top-level KPIs and volume data for the Admin Dashboard (Admin Protected)."""
    
    # 1. Total HR Users & Total Candidates
    total_hr_users = db.query(models.Hr).count()
    total_candidates = db.query(models.Candidates).count()
    
    # 2. Total Active Jobs
    total_active_jobs = db.query(models.JobPosting).filter(models.JobPosting.status == "Active").count()
    
    # 3. Total Pending/Processing Analyses
    pending_analyses = db.query(models.Analysis).filter(
        models.Analysis.analysis_status.in_(["Pending", "Processing"])
    ).count()

    # 4. Applicant Volume Data (Last 14 days)
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=13)

    # Use date to count daily applications
    volume_data_raw = (
        db.query(
            func.date(models.Application.applied_on).label('date'),
            func.count(models.Application.application_id).label('count')
        )
        .filter(models.Application.applied_on >= start_date)
        .group_by(func.date(models.Application.applied_on))
        .order_by(func.date(models.Application.applied_on))
        .all()
    )
    
    # Format the volume data to ensure every day in the range is present
    date_map = {item.date: item.count for item in volume_data_raw}
    volume_data = []
    for i in range(14):
        current_date = start_date + timedelta(days=i)
        # Apply the explicit casting logic
        raw_count: Any = date_map.get(current_date, 0)
        
        try:
            final_count = int(raw_count) if raw_count is not None and not callable(raw_count) else 0
        except (TypeError, ValueError):
            final_count = 0
        
        volume_data.append(schemas.ApplicantVolumeData(
            date=current_date,
            count=final_count
        ))

    return {
        "total_hr_users": total_hr_users,
        "total_candidates": total_candidates,
        "total_active_jobs": total_active_jobs,
        "pending_analyses": pending_analyses,
        "applicant_volume": volume_data
    }