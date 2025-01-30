import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from rate_limiter import limiter, rate_limit_error_handler
from slowapi.errors import RateLimitExceeded

load_dotenv(".env")
FRONTEND_BASE_URL_DEV = os.getenv("FRONTEND_BASE_URL_DEV")
FRONTEND_BASE_URL_PROD = os.getenv("FRONTEND_BASE_URL_PROD")

# Initializing FastAPI
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_BASE_URL_DEV, FRONTEND_BASE_URL_PROD], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

from routes.assistant_routes import assistant_router
from routes.text_speech_routes import text_speech_router

app.include_router(assistant_router, prefix="/assistant")
app.include_router(text_speech_router, prefix="/synthesis")







