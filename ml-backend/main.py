from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import cv2
import mediapipe as mp
from ultralytics import YOLO
import pymongo
import numpy as np
from datetime import datetime
from typing import Optional


app = FastAPI()

# YOLO model load (pre-trained)
yolo_model = YOLO('yolov8n.pt')  # Nano model for speed

# MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["proctor_db"]
logs_collection = db["logs"]

@app.post("/detect/focus")
async def detect_focus(file: UploadFile = File(...), meeting_id: Optional[str] = None):
    # Read frame
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Face detection and gaze (simplified)
    results = face_detection.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    if not results.detections:
        log = {"event": "face_missing", "timestamp": datetime.now(), "meeting_id": meeting_id}
        logs_collection.insert_one(log)
        return JSONResponse({"status": "violation", "message": "No face detected"})

    # Multiple faces check

    if len(results.detections) > 1:
        log = {"event": "multiple_faces", "timestamp": datetime.now(), "meeting_id": meeting_id}
        logs_collection.insert_one(log)
        return JSONResponse({"status": "violation", "message": "Multiple faces detected"})

    # Gaze detection (use MediaPipe or simple eye tracking)
    # TODO: Implement gaze detection logic here
    # Track last focus lost timestamp per meeting_id (use in-memory or DB)
    # If focus lost >10s, log violation

    return JSONResponse({"status": "ok"})

@app.post("/detect/object")
async def detect_object(file: UploadFile = File(...), meeting_id: Optional[str] = None):
    # Read frame
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # YOLO detection for phone/book/notes
    results = yolo_model(frame)

    detected = [cls for r in results for cls in r.names.values() if cls in ['cell phone', 'book', 'notebook']]
    if detected:
        log = {"event": "object_detected", "objects": detected, "timestamp": datetime.now(), "meeting_id": meeting_id}
        logs_collection.insert_one(log)
        return JSONResponse({"status": "violation", "message": f"Detected: {detected}"})

    return JSONResponse({"status": "ok"})

@app.get("/report/{meeting_id}")
async def get_report(meeting_id: str):
    logs = list(logs_collection.find({"meeting_id": meeting_id}))
    # Calculate score, etc.
    score = 100 - (len(logs) * 5)  # Simple deduction
    return JSONResponse({"logs": logs, "score": score})