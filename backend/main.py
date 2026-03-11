from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import uvicorn
import utils

app = FastAPI(title="OculoCardia AI Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None

@app.get("/")
async def root():
    return {"status": "online", "engine": "OculoCardia AI v2.0"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image contents
    contents = await file.read()
    
    try:
        # Perform advanced clinical analysis
        result = utils.analyze_retina(contents)
        
        return {
            "status": "success",
            "filename": file.filename,
            "prediction": result["metrics"],
            "visuals": result["images"],
            "message": "Clinical analysis complete."
        }
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
