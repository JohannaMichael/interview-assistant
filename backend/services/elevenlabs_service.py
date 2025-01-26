import os
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from io import BytesIO

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)

def text_to_speech_stream(text):
    response = client.text_to_speech.convert(
        voice_id="9BWtsMINqrJLrRacOk9x", # Aria voice
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_turbo_v2_5", # turbo for developers
        voice_settings=VoiceSettings(
            stability=0.3,
            similarity_boost=0.7,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    audio_stream = BytesIO()

    for chunk in response:
        if chunk:
            audio_stream.write(chunk)

    # Reset stream position to the beginning
    audio_stream.seek(0)

    return audio_stream

