from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# === ENABLE CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to ["http://localhost:5000"] for stricter settings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === MODEL SELECTION ===

# Recommended: Lightweight + public
MODEL_NAME = "microsoft/DialoGPT-medium"

# Backup options (uncomment any of these if the above fails):
# MODEL_NAME = "EleutherAI/gpt-neo-1.3B"  # Good general-purpose
# MODEL_NAME = "tiiuae/falcon-7b-instruct"  # High-quality responses, larger
# MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.1"  # Instruction-tuned, big
# MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"  # Requires access token


# === LOAD MODEL ===
print("[INFO] Loading tokenizer and model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float32)
print("[INFO] Model loaded successfully and ready to generate responses.")
print("[INFO] You can now chat with the bot via http://localhost:5000")


class Prompt(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_text(data: Prompt):
    inputs = tokenizer(data.prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=100, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"response": response}

# === ALIAS ROUTE for Frontend ===
@app.post("/chat")
async def chat_proxy(data: Prompt):
    return await generate_text(data)
