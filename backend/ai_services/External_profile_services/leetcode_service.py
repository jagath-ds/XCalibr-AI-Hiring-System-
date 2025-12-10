# ai_services/external_profile_services/leetcode_service.py
import requests
import re
import logging 

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_leetcode_username(leetcode_url: str) -> str | None:
    """
    Extracts the username from a full LeetCode profile URL.
    Example: "https://leetcode.com/johndoe/" -> "johndoe"
    """
    if not leetcode_url:
        return None
    match = re.search(r"leetcode\.com/([^/]+)/?", leetcode_url)
    return match.group(1) if match else None

def analyze_leetcode_profile(username: str) -> dict:
    """
    Fetches a user's LeetCode profile statistics using their public GraphQL API
    and calculates a LeetCode Score (Max 100 points).

    Score based on:
    - Easy problems: (max 30)
    - Medium problems: (max 40)
    - Hard problems: (max 30)

    Returns a dictionary containing the score and breakdown of problems solved.
    """
    default_return = {"leetcode_score": 0, "total_solved": 0, "easy_solved": 0, "medium_solved": 0, "hard_solved": 0}

    if not username:
        logger.warning("No LeetCode username provided for analysis.")
        return default_return

    api_url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
    """
    variables = {"username": username}
    payload = {"query": query, "variables": variables}
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}

    try:
        logger.info(f"Fetching LeetCode stats for username: {username}")
        response = requests.post(api_url, json=payload, headers=headers, timeout=10) 
        response.raise_for_status() 
        data = response.json()

        if data.get("errors"):
            logger.error(f"GraphQL error fetching LeetCode profile for {username}: {data['errors']}")
            return default_return

        matched_user = data.get("data", {}).get("matchedUser")
        if not matched_user or not matched_user.get("submitStats"):
            logger.warning(f"No submission stats found or user does not exist for LeetCode user: {username}")
            return default_return

        stats = matched_user["submitStats"].get("acSubmissionNum", [])

        total_solved, easy_solved, medium_solved, hard_solved = 0, 0, 0, 0
        for stat in stats:
            count = stat.get('count', 0)
            difficulty = stat.get('difficulty')
            if difficulty == 'All': total_solved = count
            elif difficulty == 'Easy': easy_solved = count
            elif difficulty == 'Medium': medium_solved = count
            elif difficulty == 'Hard': hard_solved = count

        # LeetCode Score Calculation (Max 100 points)
        
        # 1. Easy Score (Max 30): 1 point per easy problem, maxes out at 30 problems.
        easy_score = min(easy_solved * 1, 30)
        
        # 2. Medium Score (Max 40): 3 points per medium problem, maxes out at ~14 problems.
        medium_score = min(medium_solved * 3, 40) 
        
        # 3. Hard Score (Max 30): 5 points per hard problem, maxes out at 6 problems.
        hard_score = min(hard_solved * 5, 30)   
        
        leetcode_score = easy_score + medium_score + hard_score

        logger.info(f"Calculated LeetCode Score for {username}: {leetcode_score}/100 (E:{easy_solved}, M:{medium_solved}, H:{hard_solved})")

        return {
            "leetcode_score": leetcode_score,
            "total_solved": total_solved,
            "easy_solved": easy_solved,
            "medium_solved": medium_solved,
            "hard_solved": hard_solved
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"Network or HTTP error fetching LeetCode data for {username}: {e}")
        return default_return
    except Exception as e:
        logger.error(f"An unexpected error occurred analyzing LeETCode profile for {username}: {e}", exc_info=True)
        return default_return