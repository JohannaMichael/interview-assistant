import os
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from io import BytesIO
import uuid

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)

def text_to_speech_stream(text):
    # Perform the text-to-speech conversion
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

    # Create a BytesIO object to hold the audio data in memory
    audio_stream = BytesIO()

    # Write each chunk of audio data to the stream
    for chunk in response:
        if chunk:
            audio_stream.write(chunk)

    # Reset stream position to the beginning
    audio_stream.seek(0)

    # Return the stream for further use
    return audio_stream

