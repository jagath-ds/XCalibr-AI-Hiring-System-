# In hr_views.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload 
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/hr-views", tags=["HR Views"])


# --- ENDPOINT TO GET RANKINGS ---
@router.get("/jobs/{job_id}/rankings", response_model=schemas.JobRankingsResponse)
def get_job_rankings(
    job_id: int,
    db: Session = Depends(get_db)
    # TODO: 
):
    """
    Get ranked applicants for a specific job.
    Ranking is calculated on-the-fly from the overall_score in the Analysis table.
    """
    
    # 1. Check if job exists
    job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Query, Join, Filter, and Order!
    ranked_results = db.query(
        models.Analysis,
        models.Candidates,
        models.Application
    ).join(
        models.Application, models.Analysis.application_id == models.Application.application_id
    ).join(
        models.Candidates, models.Application.candid == models.Candidates.candid
    ).filter(
        models.Analysis.job_id == job_id
    ).order_by(
        models.Analysis.overall_score.desc().nullslast()  
    ).all()

    # 3. Format the response
    formatted_rankings = []
    for rank, (analysis, candidate, application) in enumerate(ranked_results, start=1):
        formatted_rankings.append({
            "rank": rank, # The rank is calculated here
            "application_id": application.application_id,
            "candidate_name": f"{candidate.firstname} {candidate.lastname}",
            "candidate_email": candidate.email,
            "overall_score": analysis.overall_score,
            "careerscore": analysis.careerscore,
            "githubscore": analysis.githubscore,
            "trustscore": analysis.trustscore,
            "jd_match_score": analysis.jd_match_score, 
            "leetcodescore": analysis.leetcodescore,   
            "linkedinscore": analysis.linkedinscore,
            "applied_on": application.applied_on,
            "analysis_status": analysis.analysis_status
        })

    return {
        "job_id": job_id,
        "total_applicants": len(formatted_rankings),
        "rankings": formatted_rankings
    }

@router.get("/candidates/scores", response_model=List[schemas.AnalysisRead])
def list_candidates_scores(db: Session = Depends(get_db)):
    """
    Returns a list of candidates with their analysis scores.
    Useful for HR to quickly see performance summary.
    """
    candidates_scores = db.query(models.Analysis).all()
    return candidates_scores

@router.get("/candidate/{candid}", response_model=schemas.CandidateRead)
def get_candidate_full_details(candid: int, db: Session = Depends(get_db)):
    """
    Returns full candidate details by candidate ID.
    Called when HR wants to view complete profile.
    """
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.get("/candidate/{candid}/score", response_model=schemas.AnalysisRead)
def get_candidate_score(candid: int, db: Session = Depends(get_db)):
    """
    Returns analysis/score of a single candidate.
    """
    analysis = db.query(models.Analysis).filter(models.Analysis.candid == candid).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for candidate")
    return analysis