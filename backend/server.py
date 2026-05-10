import os
import uuid
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import config
from detector_tracker import create_tracker
from validator import validate

app = FastAPI(title="TrafficAI Backend")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global tracker instance
tracker = None

# Progress storage (simple in-memory for this project)
processing_status = {
    "status": "idle",
    "progress": 0,
    "stage": "",
    "result": None
}

@app.on_event("startup")
async def startup_event():
    global tracker
    validate(exit_on_fail=False)
    tracker = create_tracker()

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        # Create unique ID for the session (we'll just use one for simplicity as per requirement)
        video_id = str(uuid.uuid4())
        file_path = Path(config.INPUT_VIDEO)
        file_path.parent.mkdir(exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        processing_status["status"] = "ready"
        processing_status["progress"] = 0
        processing_status["stage"] = "Video Uploaded"
        
        return {"id": video_id, "name": file.filename, "size": file.size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process/{video_id}")
async def start_processing(video_id: str, background_tasks: BackgroundTasks):
    global tracker
    
    if processing_status["status"] == "processing":
        return {"message": "Already processing"}

    def run_pipeline():
        try:
            processing_status["status"] = "processing"
            for update in tracker.process_video(config.INPUT_VIDEO):
                processing_status["stage"] = update["stage"]
                processing_status["progress"] = update["progress"]
                processing_status["result"] = update["metrics"]
            
            processing_status["status"] = "completed"
            processing_status["progress"] = 100
            processing_status["stage"] = "Finalized"
        except Exception as e:
            processing_status["status"] = "error"
            processing_status["stage"] = f"Error: {str(e)}"

    background_tasks.add_task(run_pipeline)
    return {"message": "Processing started"}

@app.get("/api/status/{video_id}")
async def get_status(video_id: str):
    return processing_status

@app.get("/api/results/{video_id}")
async def get_results(video_id: str):
    if processing_status["result"]:
        return processing_status["result"]
    
    # Fallback to loading from disk if memory is cleared
    if os.path.exists(config.OUTPUT_JSON):
        import json
        with open(config.OUTPUT_JSON, "r") as f:
            return json.load(f)
            
    raise HTTPException(status_code=404, detail="Results not found")

@app.get("/api/video/{video_id}")
async def get_video(video_id: str):
    if os.path.exists(config.OUTPUT_VIDEO):
        return FileResponse(config.OUTPUT_VIDEO, media_type="video/mp4")
    raise HTTPException(status_code=404, detail="Processed video not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
