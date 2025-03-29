# backend/main.py
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import mediapipe as mp
from typing import Optional
import time

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe Face Mesh setup
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    static_image_mode=False,
    max_num_faces=1
)

# Focus tracking variables
FOCUS_THRESHOLD = 0.7  # Adjust based on testing
last_focus_time = time.time()
focus_history = []

@app.post("/analyze-focus")
async def analyze_focus(frame: UploadFile):
    global last_focus_time, focus_history
    
    try:
        # Read image
        contents = await frame.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(img_rgb)
        
        if not results.multi_face_landmarks:
            return {"focus_score": 0, "message": "No face detected"}
        
        # Get eye landmarks (simplified approach)
        landmarks = results.multi_face_landmarks[0].landmark
        left_eye = [landmarks[145], landmarks[159]]  # Example landmarks
        right_eye = [landmarks[374], landmarks[386]]
        
        # Calculate eye openness (simplified)
        left_eye_open = abs(left_eye[0].y - left_eye[1].y)
        right_eye_open = abs(right_eye[0].y - right_eye[1].y)
        eye_openness = (left_eye_open + right_eye_open) / 2
        
        # Calculate gaze direction (simplified)
        gaze_x = (left_eye[0].x + right_eye[0].x) / 2
        gaze_y = (left_eye[0].y + right_eye[0].y) / 2
        
        # Focus score (0-1)
        focus_score = min(1.0, eye_openness * (1 - abs(gaze_x - 0.5)))
        
        # Update focus history
        focus_history.append(focus_score)
        if len(focus_history) > 10:
            focus_history.pop(0)
        
        avg_focus = sum(focus_history) / len(focus_history)
        
        # Determine if focus is lost
        message = None
        if avg_focus < FOCUS_THRESHOLD:
            last_focus_time = time.time()
            message = "Would you like to take a break or switch topics?"
        
        return {
            "focus_score": avg_focus,
            "message": message,
            "gaze_direction": {"x": gaze_x, "y": gaze_y}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))