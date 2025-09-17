from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from datetime import datetime

app = FastAPI()

@app.post('/detect/focus')
def detect_focus(file: UploadFile = File(...)):
    # Dummy response, replace with MediaPipe/OpenCV logic
    return JSONResponse({
        "event": "focus_detected",
        "timestamp": datetime.utcnow().isoformat(),
        "details": {"faces": 1, "gaze": "center"}
    })

@app.post('/detect/object')
def detect_object(file: UploadFile = File(...)):
    # Dummy response, replace with YOLOv8 logic
    return JSONResponse({
        "event": "object_detected",
        "timestamp": datetime.utcnow().isoformat(),
        "details": {"objects": ["phone"]}
    })
