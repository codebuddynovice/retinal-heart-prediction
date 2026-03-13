from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import uvicorn
import utils
import json
import shutil
import datetime
from pathlib import Path
from auth import router as auth_router, get_current_user, UserOut
from database import get_conn

app = FastAPI(title="OculoCardia AI Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register auth routes (/auth/register, /auth/login)
app.include_router(auth_router)

# Mount uploads static folder
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None

@app.get("/")
async def root():
    return {"status": "online", "engine": "OculoCardia AI v2.0"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    try:
        # 1. Read and analyze
        contents = await file.read()
        result = utils.analyze_retina(contents)
        
        # 2. Save image to disk
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"user_{current_user.id}_{timestamp_str}_{file.filename}"
        upload_path = Path("uploads") / safe_filename
        
        with open(upload_path, "wb") as buffer:
            buffer.write(contents)
            
        # 3. Store in database
        with get_conn() as conn:
            conn.execute(
                """INSERT INTO predictions 
                   (user_id, image_filename, prediction_json, analysis_metrics) 
                   VALUES (?, ?, ?, ?)""",
                (
                    current_user.id, 
                    str(upload_path), 
                    json.dumps(result["images"]),
                    json.dumps(result["metrics"])
                )
            )
            conn.commit()

        return {
            "status": "success",
            "filename": file.filename,
            "prediction": result["metrics"],
            "visuals": result["images"],
            "message": "Analysis saved to your medical history."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/history")
async def get_history(current_user: UserOut = Depends(get_current_user)):
    try:
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT id, image_filename, analysis_metrics, timestamp FROM predictions WHERE user_id = ? ORDER BY timestamp DESC",
                (current_user.id,)
            ).fetchall()
            
        history = []
        for r in rows:
            history.append({
                "id": r["id"],
                "image": r["image_filename"],
                "metrics": json.loads(r["analysis_metrics"]),
                "timestamp": r["timestamp"]
            })
        return {"status": "success", "history": history}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = utils.generate_chat_response(request.message, request.context)
        return {"status": "success", "response": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
