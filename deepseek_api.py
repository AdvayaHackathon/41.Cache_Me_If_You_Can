from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API Key and Endpoint
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# Request schema
class Prompt(BaseModel):
    prompt: str

@app.post("/chat")
async def generate_empathy_response(data: Prompt):
    user_prompt = data.prompt.strip()
    print(f"[PROMPT] {user_prompt}")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            "You are Serene, an AI mental health companion trained in emotional support. "
                            "Analyze the user's message deeply and respond with warmth, encouragement, and compassion. "
                            "Avoid being overly formal. Keep it human and understanding.\n\n"
                            f"User message: \"{user_prompt}\"\n"
                            "Your empathetic response:"
                        )
                    }
                ]
            }
        ]
    }

    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(GEMINI_ENDPOINT, json=payload, headers=headers)
        response.raise_for_status()

        response_text = response.json()['candidates'][0]['content']['parts'][0]['text']
        print(f"[RESPONSE] {response_text}")
        return {"response": response_text.strip()}

    except Exception as e:
        print("[ERROR]", e)
        return {"response": "I'm here for you, even if I can't find the right words right now. You're not alone."}
