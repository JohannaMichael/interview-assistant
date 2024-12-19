from models.text_to_speech_request_model import TextToSpeechRequest
from fastapi import APIRouter, HTTPException
from services.elevenlabs_service import text_to_speech_stream
from fastapi.responses import StreamingResponse

text_speech_router = APIRouter()

@text_speech_router.post("/text-to-speech")
async def convert_text_to_speech(request: TextToSpeechRequest):
    """
    Endpoint to synthesize speech using ElevenLabs API.
    """

    try:
        audio_stream = text_to_speech_stream(request.text)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))