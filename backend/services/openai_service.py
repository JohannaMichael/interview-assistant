from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import asyncio
from fastapi import UploadFile
import io

load_dotenv("../.env")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")

# Set up OpenAI client
openai = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Helper function to create a new thread
async def create_thread():
    print("Creating a new thread...")
    thread = await openai.beta.threads.create()
    return thread

# Helper function to add a message to a thread
async def add_message(thread_id, message, file_id):
    attachments = []
    # Attach file if available
    if file_id and file_id != "":
        attachments.append({"file_id": file_id, "tools": [{"type": "file_search"}]})
    print(f"Adding a new message to thread: {thread_id}")
    response = await openai.beta.threads.messages.create(
        thread_id=thread_id, 
        role="user", 
        content=message, 
        attachments=attachments
        )
    return response

# Helper function to run the assistant for a thread
async def run_assistant(thread_id):
    print(f"Running assistant for thread: {thread_id}")
    response = await openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=ASSISTANT_ID
    )
    return response

# Polling function to check the status of a run
# TODO: change this to streaming
async def check_status(thread_id, run_id):
    while True:
        run_object = await openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
        status = run_object.status
        print(f"Current status: {status}")

        if status == "completed":
            print("Run completed. Fetching messages...")
            messages = await openai.beta.threads.messages.list(thread_id=thread_id)
            return messages.data[0].content[0].text.value

        elif status == "failed": 
            print("Run failed. Returning error message")
            error = run_object.last_error
            return error

        # Wait for 5 seconds before checking again
        await asyncio.sleep(5)

async def upload_file_to_openai(file: UploadFile):
    try:
        # Read file content as bytes
        file_content = await file.read()

        # Upload the file to OpenAI
        response = await openai.files.create(
            #TODO: different filename?
            file=("upload.pdf", io.BytesIO(file_content)),  # Convert bytes to file-like object
            purpose="assistants"  # Or other valid purpose
        )
        return response.id  # Return the file ID
    except Exception as e:
        raise Exception(f"Failed to upload file to OpenAI: {str(e)}")