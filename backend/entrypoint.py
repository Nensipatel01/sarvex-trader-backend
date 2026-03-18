import sys
import traceback

try:
    print("Entrypoint: Attempting to import main...")
    from main import app
    print("Entrypoint: Import successful.")
except Exception as e:
    print("Entrypoint: Import FAILED!")
    error_trace = traceback.format_exc()
    print(error_trace)
    
    # Create a dummy app to show the error
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def root():
        return {
            "error": "Startup Crash",
            "exception": str(e),
            "traceback": error_trace
        }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
