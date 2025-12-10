# ai_services/analyzer_service.py
import json
import os
from sqlalchemy.orm import Session
import logging
import datetime
import traceback
from typing import Dict, Any, Set

from database import sessionLocal
import models
from . import utils, prompts
from . import jd_matching_service
from . import feedback_service
from .llm_clients import ollama_client

from .External_profile_services import github_service, leetcode_service, linkedin_service

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _analyze_cv_text(cv_content: str) -> dict:
    """
    Analyzes the raw text of a CV using the centralized Ollama client.
    """
    logger.info("Analyzing CV content using centralized Ollama client...")
    
    try:
        parsed_json = ollama_client.invoke_ollama_json(
            model_name="llama3",
            system_prompt=prompts.system_prompt_candidate,
            user_content=cv_content,
            temperature=0.3
        )

        # Validation logic
        required_keys = ["candidate_name", "email", "degree", "experience", "technical_skill", "certifications"]
        if not all(key in parsed_json for key in required_keys):
            logger.warning(f"Ollama CV analysis JSON missing required keys. Found: {list(parsed_json.keys())}")
            pass # Allow partial analysis
            
        logger.info("Successfully parsed JSON from Ollama CV analysis.")
        return parsed_json
        
    except (ValueError, RuntimeError) as e:
        logger.error(f"Failed to get or parse CV analysis from Ollama: {e}", exc_info=True)
        raise ValueError(f"Ollama CV analysis failed: {e}") from e


def _calculate_career_readiness(analysis_data: dict) -> dict:
    """
    Calculates the career readiness score based on CV data.
    """
    scores = {
        "experience_score": 0,      # Max 40
        "skills_score": 0,          # Max 40 (30 Tech + 10 Soft)
        "education_score": 0,       # Max 15
        "certifications_score": 0   # Max 5
    }
    total_experience_months = sum(exp.get("duration_months", 0) for exp in analysis_data.get("experience", []))
    if total_experience_months >= 60: scores["experience_score"] = 40 # 5+ years
    elif total_experience_months >= 36: scores["experience_score"] = 30 # 3-5 years
    elif total_experience_months >= 12: scores["experience_score"] = 20 # 1-3 years
    elif total_experience_months > 0: scores["experience_score"] = 10 # < 1 year
    else: scores["experience_score"] = 0

    num_technical_skills = len(analysis_data.get("technical_skill", []))
    num_soft_skills = len(analysis_data.get("soft_skill", []))
    scores["skills_score"] = min(num_technical_skills * 3, 30) + min(num_soft_skills * 2, 10)
    
    degrees = analysis_data.get("degree", [])
    if any("phd" in d.lower() for d in degrees): scores["education_score"] = 15
    elif any("master" in d.lower() for d in degrees): scores["education_score"] = 12
    elif any("bachelor" in d.lower() for d in degrees): scores["education_score"] = 8
    elif degrees: scores["education_score"] = 3 # Associate/Diploma
    else: scores["education_score"] = 0
    
    scores["certifications_score"] = min(len(analysis_data.get("certifications", [])) * 1, 5)
    
    total_score = sum(scores.values()) # Max 100
    logger.info(f"Calculated Career Readiness Score: {total_score}/100. Breakdown: {scores}")
    return {"total_score": total_score, "score_breakdown": scores}


def _calculate_trust_index(
    cv_data: Dict[str, Any],
    github_data: Dict[str, Any],
    linkedin_data: Dict[str, Any]
) -> int:
    """
    Calculates the new Trust Index Score.
    """
    trust_score = 0
    logger.info("Calculating new Trust Index Score...")

    try:
        cv_name = cv_data.get("candidate_name", "").lower().strip()
        li_name = linkedin_data.get("linkedin_data", {}).get("profile_name", "").lower().strip() 
        if cv_name and li_name:
            if cv_name == li_name:
                trust_score += 10
            else:
                if cv_name in li_name or li_name in cv_name:
                    trust_score += 5
        
        cv_email = cv_data.get("email", "").lower().strip()
        li_email = linkedin_data.get("linkedin_data", {}).get("email", "").lower().strip() 
        if cv_email and li_email and cv_email == li_email:
            trust_score += 10

        # Cross-verify CV skills with GitHub languages
        cv_skills_set = {str(skill).lower() for skill in cv_data.get("technical_skill", [])}
        github_languages_set: Set[str] = set()
        for repo in github_data.get("repos", []):
            github_languages_set.update(str(lang).lower() for lang in repo.get("languages_detailed", []))
        
        verified_git_skills = cv_skills_set.intersection(github_languages_set)
        if verified_git_skills:
            skill_score_git = min(len(verified_git_skills) * 3, 15)
            trust_score += skill_score_git

        # Cross-verify CV skills with LinkedIn skills
        li_skills_set = {str(skill).lower() for skill in linkedin_data.get("linkedin_data", {}).get("skills", [])}
        verified_li_skills = cv_skills_set.intersection(li_skills_set)
        
        if verified_li_skills:
            skill_score_li = min(len(verified_li_skills) * 3, 15)
            trust_score += skill_score_li

    except Exception as e:
        logger.error(f"Error during Trust Index calculation: {e}", exc_info=True)
    
    final_trust_score = max(0, min(trust_score, 50)) # Clamp score between 0 and 50
    logger.info(f"Total Trust Index Score: {final_trust_score}/50")
    return final_trust_score


def run_automatic_analysis(application_id: int, cv_path: str):
    """
    The main background task function.
    """
    db: Session = sessionLocal()
    try:
        logger.info(f"Background analysis started for application_id: {application_id}")
        
        analysis = db.query(models.Analysis).filter(
            models.Analysis.application_id == application_id
        ).first()
        
        if not analysis:
            logger.error(f"No analysis record found for application_id: {application_id}")
            return

        analysis.analysis_status = "In Progress"
        db.commit()

        updated_analysis = analyze_full_candidate_profile(
            candid=analysis.candid,
            cv_file_path=cv_path,
            db=db,
            application_id=application_id,
            job_id=analysis.job_id
        )

        updated_analysis.analysis_status = "Completed"
        updated_analysis.analyzed_at = datetime.datetime.now(datetime.UTC) 
        db.commit()
        logger.info(f"Successfully completed analysis for application_id: {application_id}")

    except Exception as e:
        db.rollback()
        logger.error(f"CRITICAL ERROR during background analysis for application_id: {application_id}")
        logger.error(traceback.format_exc())
        
        try:
            # Failsafe update to mark the analysis as 'Failed'
            analysis_fail_safe = db.query(models.Analysis).filter(
                models.Analysis.application_id == application_id
            ).first()
            if analysis_fail_safe:
                analysis_fail_safe.analysis_status = "Failed"
                analysis_fail_safe.remarks = json.dumps({"error": str(e)})
                db.commit()
        except Exception as db_err:
            logger.error(f"Failed to even update status to 'Failed'. DB error: {db_err}")
            db.rollback()
    finally:
        db.close()


def analyze_full_candidate_profile(candid: int, cv_file_path: str, db: Session, application_id: int, job_id: int) -> models.Analysis:
    """
    Orchestrates the entire candidate analysis workflow.
    """
    logger.info(f"Starting analysis orchestration for candid: {candid}, app_id: {application_id}")
    
    candidate = db.query(models.Candidates).filter(models.Candidates.candid == candid).first()
    if not candidate:
        raise ValueError("Candidate not found in the database")
    job = db.query(models.JobPosting).filter(models.JobPosting.job_id == job_id).first()
    if not job:
        raise ValueError("Job not found in the database")
        
    # Base score (CV Readiness + JD Match + Trust Index)
    total_possible_score = 250

    try:
        cv_content = utils.read_cv(cv_file_path)
        cv_analysis_data = _analyze_cv_text(cv_content)
    except Exception as e:
        raise RuntimeError(f"CV analysis failed: {e}") from e

    readiness_score_data = _calculate_career_readiness(cv_analysis_data)
    final_careerscore = readiness_score_data.get('total_score', 0)

    github_profile_score = 0
    github_analysis = {} 
    if job.analyze_github:
        total_possible_score += 100 # Add GitHub to total possible if enabled
        if candidate.github_link:
            github_username = github_service.get_github_username(candidate.github_link)
            if github_username:
                try:
                    github_analysis = github_service.analyze_github_profile(github_username)
                    github_profile_score = github_analysis.get("github_score", 0)
                except Exception as e:
                    logger.error(f"Error analyzing GitHub profile {github_username}: {e}", exc_info=True)
    
    leetcode_profile_score = 0
    leetcode_analysis = {} 
    if job.analyze_leetcode:
        total_possible_score += 100 # Add LeetCode to total possible if enabled
        if candidate.leetcode_link:
            leetcode_username = leetcode_service.get_leetcode_username(candidate.leetcode_link)
            if leetcode_username:
                try:
                    leetcode_analysis = leetcode_service.analyze_leetcode_profile(leetcode_username)
                    leetcode_profile_score = leetcode_analysis.get("leetcode_score", 0)
                except Exception as e:
                    logger.error(f"Error analyzing LeetCode profile {leetcode_username}: {e}", exc_info=True)

    linkedin_profile_score = 0
    linkedin_analysis = {} 
    if job.analyze_linkedin:
        total_possible_score += 50 # Add LinkedIn to total possible if enabled
        linkedin_pdf_filename = getattr(candidate, 'linkedin_pdf_link', None) 
        if linkedin_pdf_filename:
            try:
                base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) 
                LINKEDIN_PDF_UPLOAD_DIR = "uploaded_linkedin_pdfs"
                linkedin_pdf_path = os.path.join(base_dir, LINKEDIN_PDF_UPLOAD_DIR, os.path.basename(linkedin_pdf_filename))
                
                if os.path.exists(linkedin_pdf_path):
                    linkedin_pdf_content = utils.read_cv(linkedin_pdf_path)
                    if linkedin_pdf_content:
                        linkedin_analysis = linkedin_service.analyze_linkedin_pdf_text(linkedin_pdf_content)
                        linkedin_profile_score = linkedin_analysis.get("linkedin_score", 0)
                else:
                    logger.error(f"LinkedIn PDF file not found at path: {linkedin_pdf_path}")
            except Exception as e:
                logger.error(f"Error processing LinkedIn PDF analysis for {linkedin_pdf_filename}: {e}", exc_info=True)

    jd_match_score = 0
    jd_match_result = {} 
    try:
        jd_analysis_data = jd_matching_service.analyze_job_description(job.description)
        jd_match_result = jd_matching_service.get_match_analysis(
            cv_analysis=cv_analysis_data,
            jd_analysis=jd_analysis_data
        )
        jd_match_score = jd_match_result.get("match_score", 0)
        cv_analysis_data["jd_match"] = jd_match_result # Embed JD match results into the main CV analysis JSON
    except Exception as e:
        logger.error(f"Error during JD Match analysis: {e}", exc_info=True)
    
    trust_index_score = _calculate_trust_index(
        cv_data=cv_analysis_data,
        github_data=github_analysis,
        linkedin_data=linkedin_analysis
    )
    
    # Combine all six score components
    final_overall_score = (
        final_careerscore +
        jd_match_score +
        github_profile_score +
        leetcode_profile_score +
        linkedin_profile_score +
        trust_index_score
    )
    logger.info(f"Final Overall Score for app_id {application_id}: {final_overall_score} / {total_possible_score}")

    existing_analysis = db.query(models.Analysis).filter(models.Analysis.application_id == application_id).first()
    analysis_data_to_save = {
        "candid": candid,
        "job_id": job_id,
        "application_id": application_id,
        "careerscore": final_careerscore,
        "githubscore": github_profile_score,
        "trustscore": trust_index_score,
        "leetcodescore": leetcode_profile_score,
        "linkedinscore": linkedin_profile_score,
        "jd_match_score": jd_match_score, 
        "remarks": json.dumps(cv_analysis_data), # Save the full CV analysis JSON
        "overall_score": final_overall_score, 
        "total_possible_score": total_possible_score
    }
    if existing_analysis:
        for key, value in analysis_data_to_save.items():
            setattr(existing_analysis, key, value)
        analysis_report_to_return = existing_analysis
    else:
        new_analysis_report = models.Analysis(**analysis_data_to_save)
        db.add(new_analysis_report)
        analysis_report_to_return = new_analysis_report

    # Generate and save the candidate-facing professional feedback
    logger.info(f"Generating professional feedback text for report ID: {analysis_report_to_return.reportid}")
    try:
        feedback_text = feedback_service.generate_hr_feedback(
            analysis_data=cv_analysis_data,
            db_report=analysis_report_to_return,
            job=job
        )
        # Save the generated text to the 'feedback' column
        analysis_report_to_return.feedback = feedback_text
        logger.info("Successfully generated and queued feedback text for saving.")
    except Exception as fb_err:
        logger.error(f"Failed to generate default feedback text: {fb_err}", exc_info=True)
        # Save the error so the HR can see why it failed
        analysis_report_to_return.feedback = json.dumps({"error": f"Feedback generation failed: {str(fb_err)}"})

    try:
        db.commit() # This commit saves all analysis scores AND the new feedback text
        db.refresh(analysis_report_to_return)
        logger.info(f"Successfully saved analysis report ID: {analysis_report_to_return.reportid} for app_id {application_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Database error saving analysis report for app_id {application_id}: {e}", exc_info=True)
        raise RuntimeError(f"Failed to save analysis report to database: {e}") from e

    return analysis_report_to_return