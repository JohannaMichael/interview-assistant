import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.assistant_routes import assistant_router
from routes.text_speech_routes import text_speech_router

load_dotenv(".env")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL")

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_BASE_URL], 
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(assistant_router, prefix="/assistant")
app.include_router(text_speech_router, prefix="/synthesis")







