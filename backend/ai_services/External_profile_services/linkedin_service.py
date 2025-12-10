# ai_services/external_profile_services/linkedin_service.py
import logging
from typing import Dict, Any

# Assuming ollama_client is in the parent directory's llm_clients subfolder
# Adjust the import path if your structure is different
from ..llm_clients import ollama_client 
from .. import prompts # Import prompts from the parent directory

logger = logging.getLogger(__name__) 

# Max score for LinkedIn analysis is now 50
LINKEDIN_MAX_SCORE = 50 

def analyze_linkedin_pdf_text(profile_text: str) -> Dict[str, Any]: 
    """
    Analyzes text extracted from a LinkedIn profile PDF using Ollama
    and calculates a score based on content completeness and keywords.

    Args:
        profile_text: The full text content extracted from the LinkedIn PDF.

    Returns:
        A dictionary containing the calculated score and the structured data
        extracted by the LLM. Returns default values if analysis fails.
    """
    if not profile_text: 
        logger.warning("No LinkedIn profile text provided for analysis.") 
        return {"linkedin_score": 0, "linkedin_data": {}, "error": "No text provided"} 

    logger.info("Starting LinkedIn PDF text analysis using Ollama.") 
    structured_data = {} 
    error_message = None 

    try:
        # Use the Ollama client to get structured data
        structured_data = ollama_client.invoke_ollama_json( 
            model_name="llama3", # Or your preferred model 
            system_prompt=prompts.system_prompt_linkedin_pdf, 
            user_content=profile_text, 
            temperature=0.2 # Lower temperature for extraction 
        )
        logger.info("Successfully extracted structured data from LinkedIn PDF text.") 

    except (ValueError, RuntimeError) as e:
        logger.error(f"Failed to get structured data from LinkedIn PDF text via Ollama: {e}") 
        error_message = f"Ollama analysis failed: {e}" 
        # Return default score but include the error
        return {"linkedin_score": 0, "linkedin_data": {}, "error": error_message} 
    except Exception as e:
        logger.error(f"Unexpected error during LinkedIn PDF analysis: {e}", exc_info=True) 
        error_message = f"Unexpected error: {e}" 
        return {"linkedin_score": 0, "linkedin_data": {}, "error": error_message} 

    # Calculate Score (Max 50 points)
    score = 0 
    score_details = {} # Optional: For debugging score calculation 

    try:
        # Score for Summary (Max 10 points)
        if structured_data.get("summary_section", "").strip(): 
            summary_len = len(structured_data["summary_section"].split()) 
            if summary_len > 100: score += 10 # Well-detailed
            elif summary_len > 30: score += 5 # Good summary
            else: score += 2 # Has summary
            score_details["summary"] = score 
        else:
            score_details["summary"] = 0 


        # Score for Experience (Max 20 points)
        experience_list = structured_data.get("experience", []) 
        if experience_list: 
            score += min(len(experience_list) * 4, 12) # Points for number of roles (max 12) 
            # Add points if duration text seems reasonable (simple check)
            if any("present" in exp.get("duration_text", "").lower() or "yr" in exp.get("duration_text", "").lower() or "mo" in exp.get("duration_text", "").lower() for exp in experience_list): 
                score += 8 # Points for having duration details (max 8) 
        score_details["experience"] = score - score_details.get("summary", 0) 


        # Score for Education (Max 10 points)
        education_list = structured_data.get("education", []) 
        if education_list: 
            # Points for having any education listed
            score += 2 
            # Add points if degree/field is mentioned
            if any(edu.get("degree") or edu.get("field_of_study") for edu in education_list): 
                score += min(len(education_list) * 4, 8) # More points for details (max 8) 
        score_details["education"] = score - score_details.get("summary", 0) - score_details.get("experience", 0) 


        # Score for Skills (Max 10 points)
        skills_list = structured_data.get("skills", []) 
        if skills_list: 
            score += min(len(skills_list) // 2, 10) # 1 point per 2 skills, max 10 
        score_details["skills"] = score - score_details.get("summary", 0) - score_details.get("experience", 0) - score_details.get("education", 0) 


        # Ensure score doesn't exceed max
        linkedin_score = max(0, min(score, LINKEDIN_MAX_SCORE)) 
        logger.info(f"Calculated LinkedIn PDF Score: {linkedin_score}/{LINKEDIN_MAX_SCORE}. Details: {score_details}") 

    except Exception as e:
        logger.error(f"Error calculating score from LinkedIn PDF data: {e}", exc_info=True) 
        linkedin_score = 0 # Default to 0 if scoring fails 
        error_message = f"Scoring failed: {e}" 

    return { 
        "linkedin_score": linkedin_score, 
        "linkedin_data": structured_data, # Return the extracted data 
        "error": error_message # Will be None if everything succeeded 
    }