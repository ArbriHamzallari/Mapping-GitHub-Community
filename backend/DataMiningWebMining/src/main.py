# main.py
#new updated
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .crawler import run_crawler
from .analytics import process_graph


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/mine/{username}")
def mine_endpoint(username: str):
    try:
        # Step 1: Run Crawler (Member 1 & 2 Logic)
        edges, nodes_info = run_crawler(username)

        # Check if we got any data
        if not edges or len(edges) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No connections found for user '{username}'. The user may not exist or have no public connections."
            )

        # Step 2: Run Analysis (Member 3 Logic)
        final_data = process_graph(edges, nodes_info)

        return final_data
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        # Handle any other unexpected errors
        print(f"❌ Error processing {username}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing '{username}': {str(e)}"
        )
# ... all your existing code ...

if __name__ == "__main__":
    import uvicorn
    # This keeps the program running and listening on port 8000
    # Note: reload=True may cause issues when running directly, use reload=False or run via uvicorn command
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
# Run with: uvicorn main:app --reload --host 127.0.0.1 --port 8000