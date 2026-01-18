# Data Mining Web Scraper - Backend

FastAPI backend for GitHub community graph analysis.

## Setup Instructions

### Step 1: Navigate to Backend Directory
```powershell
cd backend\DataMiningWebMining
```

### Step 2: Create Virtual Environment (Recommended)
```powershell
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies
```powershell
pip install -r requirements.txt
```

Or install manually:
```powershell
pip install fastapi uvicorn[standard] PyGithub networkx python-louvain matplotlib pyvis
```

### Step 4: Configure GitHub Token (IMPORTANT)

Edit `src\github_client.py` and replace `GITHUB_TOKEN` with your own GitHub Personal Access Token:
```python
GITHUB_TOKEN = "your_token_here"
```

To create a GitHub token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `read:user` permission
3. Copy the token and paste it in `github_client.py`

### Step 5: Run the Backend Server

**Option A: Run directly with Python**
```powershell
cd src
python main.py
```

**Option B: Run with Uvicorn (Recommended)**
```powershell
cd src
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The server will start on `http://127.0.0.1:8000`

### Step 6: Test the API

Open browser or use curl:
```powershell
curl http://127.0.0.1:8000/mine/github_username
```

Or visit: `http://127.0.0.1:8000/docs` for interactive API documentation

## Project Structure

```
backend/DataMiningWebMining/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── github_client.py     # GitHub API client
│   ├── crawler.py           # BFS crawler for user network
│   └── analytics.py         # Graph analysis and visualization
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Troubleshooting

**Error: ModuleNotFoundError**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**Error: GitHub API Rate Limit**
- Check your GitHub token is valid
- Token might need more permissions

**Error: Port 8000 already in use**
- Change port in `main.py` or use: `uvicorn main:app --port 8001`
