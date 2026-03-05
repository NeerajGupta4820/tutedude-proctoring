# main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse  # ✅ 'responses' (plural)
from fastapi.middleware.cors import CORSMiddleware  # ✅ CORS add karo
from pydantic import BaseModel
from langchain_ollama import OllamaLLM
import requests
import json

app = FastAPI(title="TuteDude AI Service")

# ✅ CORS enable karo (Node.js se call karne ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # Node.js backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = None
try:
    llm = OllamaLLM(model='llama3.2', base_url="http://localhost:11434")
    print("✅ Connected to Llama 3.2")
except Exception as e:
    print(f"❌ Failed to connect to Ollama: {e}")


class ChatRequest(BaseModel):
    prompt: str
    conversationHistory: list = []


@app.get("/")
def home():
    return {"status": "AI service is running"}


# ✅ STREAMING ENDPOINT
@app.post("/api/ai-chat-stream")
async def chat_stream(request: ChatRequest):
    if not llm:
        return {"error": "Model not loaded"}

    def generate():
        try:
            # Direct Ollama HTTP API call for streaming
            url = "http://localhost:11434/api/generate"
            payload = {
                "model": "llama3.2",
                "prompt": request.prompt,
                "stream": True
            }

            with requests.post(url, json=payload, stream=True) as resp:
                for line in resp.iter_lines():
                    if line:
                        data = json.loads(line)
                        if 'response' in data:
                            yield data['response']  # Send chunk

        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")  # ✅ Fixed


# ✅ NON-STREAMING ENDPOINT (Backup)
@app.post("/chat")
def chat(request: ChatRequest):
    if not llm:
        return {"error": "Model not loaded"}
     
    response = llm.invoke(request.prompt)
    return {"reply": response}