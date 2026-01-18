# github_client.py
from github import Github, GithubException

# REPLACE WITH YOUR ACTUAL TOKEN
GITHUB_TOKEN = "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"


def get_github_connection():
    """Authenticates and returns the Github object."""
    return Github(GITHUB_TOKEN)


# backend/github_client.py (Updated)

def fetch_user_data(username):
    """
    Fetches raw data for a single user.
    Returns a dictionary with their info and a list of who they follow.
    """
    g = get_github_connection()
    try:
        user = g.get_user(username)

        # Get basic info
        user_info = {
            "login": user.login,
            "followers_count": user.followers,
            "following": []
        }

        # --- FIXED LOOP (SAFER THAN SLICING) ---
        count = 0
        # iterating directly is safe, even if they have 0 followers
        for person in user.get_followers():
            if count >= 10:
                break  # Stop after 10 people

            user_info["following"].append(person.login)
            count += 1
        # ---------------------------------------

        return user_info

    except GithubException as e:
        print(f"⚠️ Error fetching {username}: {e}")
        return None
    except Exception as e:
        print(f"Unknown error for {username}: {e}")
        return None