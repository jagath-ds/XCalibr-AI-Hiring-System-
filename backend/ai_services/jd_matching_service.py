# ai_services/jd_matching_service.py
import json
import logging

from .llm_clients import ollama_client
from . import prompts

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def analyze_job_description(job_description: str) -> dict:
    """
    Analyzes the raw text of a job description using the centralized
    Ollama client and returns a structured JSON object of its key requirements.
    """
    logger.info("Analyzing JD content using centralized Ollama client...")
    
    try:
        parsed_json = ollama_client.invoke_ollama_json(
            model_name="llama3",
            system_prompt=prompts.system_prompt_job,
            user_content=job_description,
            temperature=0.3
        )

        required_keys = ["degree", "experience_years", "technical_skill", "soft_skill"]
        if not all(key in parsed_json for key in required_keys):
            logger.warning(f"Ollama JD analysis JSON missing required keys. Found: {list(parsed_json.keys())}")
            raise ValueError("JD analysis JSON from Ollama is missing required keys.")

        logger.info("Successfully parsed JSON from Ollama JD analysis.")
        return parsed_json

    except (ValueError, RuntimeError) as e:
        logger.error(f"Failed to get or parse JD analysis from Ollama: {e}", exc_info=True)
        raise RuntimeError(f"Ollama JD analysis failed: {e}") from e


def get_match_analysis(cv_analysis: dict, jd_analysis: dict) -> dict:
    """
    Performs a detailed match analysis between structured CV and JD data
    using the centralized Ollama client.
    """
    logger.info("Performing CV-JD match analysis using centralized Ollama client...")

    try:
        # Combine the CV and JD into a single prompt for the LLM
        combined_content = f"""
        Here is the candidate's profile based on their CV:
        ---CANDIDATE START---
        {json.dumps(cv_analysis, indent=2)}
        ---CANDIDATE END---

        Here are the key requirements for the job:
        ---JOB START---
        {json.dumps(jd_analysis, indent=2)}
        ---JOB END---
        """
    except Exception as e:
        logger.error(f"Error formatting combined content for match analysis: {e}", exc_info=True)
        raise ValueError("Could not format CV/JD data for Ollama input.") from e

    try:
        parsed_json = ollama_client.invoke_ollama_json(
            model_name="llama3",
            system_prompt=prompts.system_prompt_matching,
            user_content=combined_content,
            temperature=0.5
        )

        required_keys = ["match_score", "summary", "pros", "cons"]
        if not all(key in parsed_json for key in required_keys):
            logger.warning(f"Ollama match analysis JSON missing required keys. Found: {list(parsed_json.keys())}")
            raise ValueError("Match analysis JSON from Ollama is missing required keys.")

        if not (0 <= parsed_json.get("match_score", -1) <= 100):
            logger.warning(f"Ollama returned an invalid match_score: {parsed_json.get('match_score')}")
            # Clamping the score could be an option here if needed
            # parsed_json["match_score"] = max(0, min(100, parsed_json.get("match_score", 0)))

        logger.info("Successfully parsed JSON from Ollama match analysis.")
        return parsed_json

    except (ValueError, RuntimeError) as e:
        logger.error(f"Failed to get or parse Match analysis from Ollama: {e}", exc_info=True)
        raise RuntimeError(f"Ollama Match analysis failed: {e}") from e