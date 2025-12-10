# ai_services/external_profile_services/github_service.py

import requests
import re
import logging
from typing import List, Dict, Set, Any 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_github_username(github_url: str) -> str | None:
    """
    Extracts the username from a full GitHub profile URL.
    Example: "https://github.com/johndoe" -> "johndoe"
    """
    if not github_url:
        return None
    # Use regex to find the username part of the URL
    match = re.search(r"github\.com/([a-zA-Z0-9_-]+)", github_url) 
    return match.group(1) if match else None 

def analyze_github_profile(username: str) -> dict:
    """
    Fetches a user's GitHub profile and repositories to generate a GitHub Score
    and gather detailed repository information including all languages used.

    The score (max 100) is based on:
    - Number of public repositories (max 30 points)
    - Follower count (max 30 points)
    - Total stars across all repositories (max 40 points)

    Returns a dictionary containing the GitHub score and a list of detailed
    repository data (including languages).
    """
    if not username:
        logger.warning("No GitHub username provided for analysis.")
        return {"github_score": 0, "repos": []}

    base_url = "https://api.github.com"
    headers = {"Accept": "application/vnd.github.v3+json"} 

    profile_data: Dict[str, Any] = {}
    repos_data: List[Dict[str, Any]] = []

    try:
        # Fetch user profile data
        user_url = f"{base_url}/users/{username}"
        logger.info(f"Fetching GitHub user profile: {user_url}")
        user_response = requests.get(user_url, headers=headers, timeout=10)
        user_response.raise_for_status() 
        profile_data = user_response.json() 

        # Fetch user repositories (paginated potentially, but let's get up to 100 recent)
        repo_url = f"{base_url}/users/{username}/repos?sort=updated&per_page=100"
        logger.info(f"Fetching GitHub repositories: {repo_url}")
        repo_response = requests.get(repo_url, headers=headers, timeout=15)
        repo_response.raise_for_status() 
        basic_repos_data = repo_response.json() 

        # GitHub Score Calculation (Max 100 points)
        
        # 1. Repo Score (Max 30): 3 points per repo, maxes out at 10 repos.
        repos_score = min(profile_data.get("public_repos", 0) * 3, 30)
        
        # 2. Follower Score (Max 30): 1 point per 2 followers, maxes out at 60 followers.
        followers_score = min(profile_data.get("followers", 0) // 2, 30) 
        
        # 3. Star Score (Max 40): 1 point per 5 stars, maxes out at 200 stars.
        total_stars = sum(repo.get("stargazers_count", 0) for repo in basic_repos_data) 
        stars_score = min(total_stars // 5, 40) 
        
        github_score = followers_score + repos_score + stars_score 
        logger.info(f"Calculated GitHub Score for {username}: {github_score}/100")


        # Fetch Languages for Each Repo
        detailed_repos_data = []
        logger.info(f"Fetching languages for {len(basic_repos_data)} repositories...")
        for repo in basic_repos_data:
            repo_name = repo.get("name")
            if not repo_name:
                continue

            lang_url = f"{base_url}/repos/{username}/{repo_name}/languages"
            try:
                lang_response = requests.get(lang_url, headers=headers, timeout=5) 
                lang_response.raise_for_status()
                languages_data = lang_response.json() 
                repo["languages_detailed"] = list(languages_data.keys()) 
            except requests.exceptions.RequestException as lang_err:
                logger.warning(f"Could not fetch languages for repo '{repo_name}': {lang_err}")
                repo["languages_detailed"] = [] 
            detailed_repos_data.append(repo)
        repos_data = detailed_repos_data
        logger.info("Finished fetching repository languages.")


        return {
            "github_score": github_score,
            "repos": repos_data # Now includes 'languages_detailed'
        }

    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error fetching GitHub data for {username}: {http_err}")
        if http_err.response.status_code == 404:
            logger.error(f"GitHub user '{username}' not found.")
        return {"github_score": 0, "repos": []}
    except requests.exceptions.RequestException as req_err:
        logger.error(f"Network error fetching GitHub data for {username}: {req_err}")
        return {"github_score": 0, "repos": []}
    except Exception as e:
        logger.error(f"Unexpected error analyzing GitHub profile for {username}: {e}", exc_info=True)
        return {"github_score": 0, "repos": []}