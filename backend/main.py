from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
