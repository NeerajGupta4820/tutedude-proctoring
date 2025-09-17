# Focus & Object Detection in Video Interviews

A full-stack proctoring platform for video interviews with real-time focus and object detection.

## Monorepo Structure

- `client/` — React 18 + Vite + TailwindCSS frontend
- `server/` — Node.js + Express backend (ESM, MongoDB, Socket.io, JWT)
- `ml-backend/` — Python FastAPI ML backend (MediaPipe, YOLOv8)
- `docs/` — Documentation and environment examples

## Quick Start

### 1. Install dependencies

```
# In root
npm install

# In client
cd client && npm install

# In server
cd ../server && npm install

# In ml-backend
cd ../ml-backend && pip install -r requirements.txt
```

### 2. Start development

```
# In root (runs client + server)
npm run dev

# In ml-backend (separate terminal)
cd ml-backend
uvicorn main:app --reload
```

### 3. Environment Variables

- See `.env.example` in each service folder for required variables.

---

## Features
- Real-time webcam proctoring
- Focus detection (face, gaze, multiple faces)
- Object detection (phones, books, notes)
- Live logs and session reports

---

## License
MIT
