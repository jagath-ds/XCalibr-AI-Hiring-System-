# ai_services/prompts.py
import json

# --- Prompt for CV Analysis (Ollama JSON Mode) ---
cv_analysis_schema = {
    "type": "object",
    "properties": {
        "candidate_name": {"type": "string", "description": "Full name of the candidate."},
        "email": {"type": "string", "description": "Candidate's email address."},
        "degree": {"type": "array", "items": {"type": "string"}, "description": "List of degrees obtained."},
        "experience": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Job title or role."},
                "duration_months": {"type": "integer", "description": "Duration of the experience in months."}
            },
            "required": ["title", "duration_months"]
        }, "description": "List of work experiences."},
        "technical_skill": {"type": "array", "items": {"type": "string"}, "description": "List of technical skills (languages, frameworks, tools)."},
        "certifications": {"type": "array", "items": {"type": "string"}, "description": "List of certifications held."},
        "soft_skill": {"type": "array", "items": {"type": "string"}, "description": "List of soft skills mentioned or inferred."}
    },
    "required": ["candidate_name", "degree", "experience", "technical_skill", "certifications"]
}

system_prompt_candidate = f"""
You are an expert CV analysis tool. Analyze the provided CV text to extract key information.
Respond *ONLY* with a valid JSON object conforming exactly to the following schema. Do not add any explanatory text, markdown formatting, or anything else before or after the JSON object.

JSON Schema:
{json.dumps(cv_analysis_schema, indent=2)}

Guidelines:
- Experience `duration_months` should be calculated based on the start and end dates if provided, otherwise estimate or use 0 if unclear.
- `technical_skill` should list specific programming languages, frameworks, databases, cloud platforms, and tools.
- `soft_skill` (optional) can be inferred from descriptions of teamwork, communication, leadership, etc.
- If information for a field is not found, use a sensible default (e.g., "" for strings, [] for arrays, 0 for integers). Ensure all required fields are present even if empty.
"""

# --- Prompt for Job Description Analysis (Ollama JSON Mode) ---
jd_analysis_schema = {
    "type": "object",
    "properties": {
        "degree": {"type": "array", "items": {"type": "string"}, "description": "List of required or preferred degrees."},
        "experience_years": {"type": "integer", "description": "Minimum years of experience required."},
        "technical_skill": {"type": "array", "items": {"type": "string"}, "description": "List of required technical skills."},
        "soft_skill": {"type": "array", "items": {"type": "string"}, "description": "List of required or desired soft skills."}
    },
    "required": ["degree", "experience_years", "technical_skill", "soft_skill"]
}

system_prompt_job = f"""
You are an expert job description analysis tool. Analyze the provided job description text and extract the key requirements.
Respond *ONLY* with a valid JSON object conforming exactly to the following schema. Do not add any explanatory text, markdown formatting, or anything else before or after the JSON object.

JSON Schema:
{json.dumps(jd_analysis_schema, indent=2)}

Guidelines:
- Extract the minimum `experience_years` mentioned (e.g., "3-5 years" -> 3). If no specific number is mentioned, use 0.
- Only list educational `degree` qualifications and `technical_skill` items explicitly mentioned.
- You *can* infer logical `soft_skill` requirements (e.g., 'teamwork', 'communication') if implied by phrases like "collaborate with teams" or "present findings".
- If information for a field is not found, use a sensible default (e.g., [] for arrays, 0 for integers). Ensure all required fields are present.
"""

# --- Prompt for CV-JD Matching Analysis (Ollama JSON Mode) ---
matching_analysis_schema = {
    "type": "object",
    "properties": {
        "match_score": {"type": "integer", "description": "A score from 0 to 100 indicating the candidate's suitability for the job."},
        "summary": {"type": "string", "description": "A brief (2-3 sentence) summary of the candidate's overall fit for the role, highlighting key strengths."},
        "pros": {"type": "array", "items": {"type": "string"}, "description": "Specific points (bullet points) where the candidate meets or exceeds job requirements."},
        "cons": {"type": "array", "items": {"type": "string"}, "description": "Specific points (bullet points) where the candidate falls short of job requirements or areas of potential concern."}
    },
    "required": ["match_score", "summary", "pros", "cons"]
}

system_prompt_matching = f"""
You are an expert recruitment analyst. Based on the provided candidate CV analysis (JSON) and the job description analysis (JSON), perform a detailed match assessment.
Respond *ONLY* with a valid JSON object conforming exactly to the following schema. Do not add any explanatory text, markdown formatting, or anything else before or after the JSON object.

JSON Schema:
{json.dumps(matching_analysis_schema, indent=2)}

Guidelines:
1.  Calculate a `match_score` (0-100) based on how well the candidate's experience duration, degrees, technical skills, and certifications align with the job requirements. Give higher weight to technical skills and experience years.
2.  Write a concise `summary` highlighting the candidate's strongest qualifications for *this specific role* and mentioning the overall alignment.
3.  List specific, evidence-based `pros` (reasons for suitability) based on the comparison.
4.  List specific, evidence-based `cons` (areas where the candidate falls short) based on the comparison. If there are no clear cons, provide an empty array [].
"""

# --- NEW: Prompt for LinkedIn Profile PDF Analysis (Ollama JSON Mode) ---
# --- UPDATED: Added 'profile_name' and 'email' for Trust Index ---
linkedin_pdf_analysis_schema = {
    "type": "object",
    "properties": {
        "profile_name": {"type": "string", "description": "Full name of the candidate as it appears on the profile."},
        "email": {"type": "string", "description": "Candidate's email address, if listed in contact info."},
        "summary_section": {"type": "string", "description": "The text content of the 'About' or 'Summary' section."},
        "experience": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Job title or role."},
                "company": {"type": "string", "description": "Company name."},
                "duration_text": {"type": "string", "description": "Text describing the duration (e.g., 'Jan 2020 - Present · 4 yrs', '3 yrs 5 mos')."}
            },
            "required": ["title", "company", "duration_text"]
        }, "description": "List of work experiences."},
        "education": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "institution": {"type": "string", "description": "Name of the school or university."},
                "degree": {"type": "string", "description": "Degree obtained (e.g., 'Bachelor of Science', 'Master of Arts')."},
                "field_of_study": {"type": "string", "description": "Field of study (e.g., 'Computer Science')."}
            },
            "required": ["institution"]
        }, "description": "List of educational qualifications."},
        "skills": {"type": "array", "items": {"type": "string"}, "description": "List of skills mentioned, often under a 'Skills' or 'Top Skills' section."}
    },
    # Only 'experience' and 'skills' are required for basic scoring.
    # Name and email are optional bonuses for the Trust Index.
    "required": ["experience", "skills"]
}

system_prompt_linkedin_pdf = f"""
You are an expert LinkedIn profile analysis tool. Analyze the provided text extracted from a LinkedIn profile PDF.
Respond *ONLY* with a valid JSON object conforming exactly to theD schema. Do not add any explanatory text, markdown formatting, or anything else before or after the JSON object.

JSON Schema:
{json.dumps(linkedin_pdf_analysis_schema, indent=2)}

Guidelines:
- Extract `profile_name` and `email` if they are present.
- Extract the text content from the relevant sections (Summary/About, Experience, Education, Skills).
- For `experience`, capture the title, company, and the duration text as presented. Do not calculate months/years yourself.
- For `education`, capture the institution name and degree/field if available.
- For `skills`, list the skills mentioned in the skills section.
- If a section or specific field within a section is not found in the text, use a sensible default (e.g., "" for strings, [] for arrays). Ensure all required fields in the schema are present, even if empty.
"""