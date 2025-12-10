# ai_services/feedback_service.py
import json
import models 
import logging

logger = logging.getLogger(__name__)


def generate_hr_feedback(analysis_data: dict, db_report: models.Analysis, job: models.JobPosting) -> str:
    """
    Generates a professional, neutral, and detailed feedback email for the candidate,
    including their full AI analysis report.

    Args:
        analysis_data: The raw structured JSON data from the AI's CV analysis.
        db_report: The SQLAlchemy `Analysis` model object from the database.
        job: The SQLAlchemy `JobPosting` model object for this application.
    """
    try:
        cv_analysis_data = analysis_data if analysis_data else {}
        candidate_name = cv_analysis_data.get('candidate_name', 'Candidate')
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error accessing candidate name for report ID {db_report.reportid}: {e}")
        candidate_name = 'Candidate'
        cv_analysis_data = {}

    company_name = job.company_name or "our company"
    job_title = job.title or "the role"
    hr_team_name = job.company_name or "The HR Team"

    # This is the neutral, candidate-facing template
    
    feedback = f"Dear {candidate_name},\n\n"
    feedback += f"Thank you for your interest in the {job_title} position at {company_name}.\n\n"
    feedback += "As part of our commitment to a transparent hiring process, we provide all candidates with a detailed, AI-generated analysis of their application. You can use these insights for your professional development.\n\n"
    
    total_possible_score = db_report.total_possible_score or 500 
    
    feedback += f"**Overall Profile Score:** {db_report.overall_score or 0} / {total_possible_score}\n\n"
    feedback += "**Score Breakdown:**\n"
    feedback += f"- **Career Readiness Score (from CV):** {db_report.careerscore or 0} / 100\n"
    feedback += f"- **JD Match Score (CV vs. Job):** {db_report.jd_match_score or 0} / 100\n"
    
    # Conditionally show scores only if they were part of the analysis
    if db_report.githubscore or 0 > 0 or total_possible_score > 400:
        feedback += f"- **GitHub Profile Score:** {db_report.githubscore or 0} / 100\n"
    if db_report.leetcodescore or 0 > 0 or total_possible_score > 400:
        feedback += f"- **LeetCode Profile Score:** {db_report.leetcodescore or 0} / 100\n"
    if db_report.linkedinscore or 0 > 0 or total_possible_score > 450:
        feedback += f"- **LinkedIn Profile Score:** {db_report.linkedinscore or 0} / 50\n"
        
    feedback += f"- **Trust Index Score (Verification):** {db_report.trustscore or 0} / 50\n\n"

    feedback += "**AI-Powered Insights:**\n"

    if db_report.trustscore is not None:
        if db_report.trustscore > 35:
            feedback += "- **Excellent Verification**: Your CV, GitHub, and LinkedIn profiles are well-aligned. This high Trust Index is a great indicator of reliability.\n"
        elif db_report.trustscore < 15:
            feedback += "- **Trust Index Suggestion**: To improve your profile's credibility, ensure your name, email, and technical skills are consistent across your CV, GitHub, and LinkedIn profiles.\n"

    if db_report.githubscore is not None and (db_report.githubscore > 0 or total_possible_score > 400):
        if db_report.githubscore < 40: 
            feedback += "- **GitHub Activity Suggestion**: We recommend increasing your activity on GitHub. A more active profile with well-documented projects is a powerful way to showcase your passion and practical coding skills.\n"
        elif db_report.githubscore >= 60:
            feedback += "- **Good GitHub Presence**: Your GitHub profile shows consistent activity and demonstrates your practical coding skills.\n"

    if db_report.leetcodescore is not None and (db_report.leetcodescore > 0 or total_possible_score > 400):
        if db_report.leetcodescore < 30: 
            feedback += "- **Problem-Solving Suggestion**: Consider dedicating regular time to problem-solving on platforms like LeetCode. Focusing on Medium-difficulty problems can significantly boost your score.\n"
        elif db_report.leetcodescore >= 60:
            feedback += "- **Strong Problem-Solving**: Your LeetCode activity indicates strong problem-solving and algorithmic thinking abilities, which are highly valued.\n"

    if db_report.linkedinscore is not None and (db_report.linkedinscore > 0 or total_possible_score > 450):
        if db_report.linkedinscore > 25:
            feedback += "- **Strong LinkedIn Profile**: Your LinkedIn profile is well-detailed, helping us get a comprehensive view of your experience and skills.\n"

    cv_feedback_details = _generate_cv_feedback_details(cv_analysis_data, db_report)
    feedback += cv_feedback_details

    # A neutral closing statement
    feedback += f"\nOur HR team will review this analysis and be in touch with the next steps regarding your application shortly.\n\n"
    feedback += f"Sincerely,\nThe {hr_team_name} Team"
    
    return feedback


def _generate_cv_feedback_details(analysis_data: dict, db_report: models.Analysis) -> str:
    """
    Helper function to generate the CV-specific part of the feedback.
    """
    if not analysis_data: 
        return ""

    feedback_text = ""
    strengths, improvements = [], []

    if db_report.careerscore is not None and db_report.careerscore >= 70:
        strengths.append("Your overall CV shows a strong alignment with industry expectations and best practices.")
    if len(analysis_data.get("technical_skill", [])) >= 5:
        strengths.append("You have demonstrated a diverse and in-demand technical skill set.")
    
    if db_report.careerscore is not None and db_report.careerscore < 50:
        improvements.append("Consider gaining more hands-on experience through internships, personal projects, or contributions to open-source to bolster practical skills.")
    if not analysis_data.get("certifications"):
        improvements.append("Pursuing industry-recognized certifications (e.g., from AWS, Google Cloud, Azure, etc.) can formally validate your expertise in key areas.")
    
    if strengths:
        feedback_text += "\n**Strengths Highlighted from your CV:**\n" 
        feedback_text += "".join(f"- {s}\n" for s in strengths)

    if improvements:
        feedback_text += "\n**Potential Areas for Improvement based on your CV:**\n" 
        feedback_text += "".join(f"- {i}\n" for i in improvements)

    return feedback_text

def send_feedback_email(email: str, feedback: str):
    """
    Placeholder function to send the generated feedback email.
    """
    logger.info(f"--- SIMULATING EMAIL DISPATCH to {email} ---")
    print(f"--- SIMULATING EMAIL DISPATCH to {email} ---")
    print(feedback)
    print("--- EMAIL SENT SUCCESSFULLY ---")
    logger.info("--- EMAIL SENT SUCCESSFULLY (Simulated) ---")