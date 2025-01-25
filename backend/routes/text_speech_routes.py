from models.text_to_speech_request_model import TextToSpeechRequest
from fastapi import APIRouter, HTTPException, Request
from services.elevenlabs_service import text_to_speech_stream
from fastapi.responses import StreamingResponse
from rate_limiter import limiter

text_speech_router = APIRouter()

@text_speech_router.post("/text-to-speech")
@limiter.limit("10/second")
@limiter.limit("100/minute")
async def convert_text_to_speech(request: Request, text_request: TextToSpeechRequest):
    """
    Endpoint to synthesize speech using ElevenLabs API.
    """

    try:
        audio_stream = text_to_speech_stream(text_request.text)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))