from cProfile import run
import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from openai import AsyncOpenAI
import io

# Load environment variables
load_dotenv("../.env")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")

#UPLOAD_DIR = Path("uploads")
#UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Set up OpenAI client
openai = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Request model for the /message endpoint
class MessageRequest(BaseModel):
    threadId: str
    message: str
    file_id: Optional[str] = None

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
# TODO: change this to streaming?
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

#=========================================================
#============== ROUTE SERVER =============================
#=========================================================

@app.get("/thread")
async def thread_route():
    # Endpoint to create a new thread
    thread = await create_thread()
    return thread.id

@app.post("/message")
async def message_route(request: MessageRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to add a message to a thread and run the assistant.
    Uses a background task to poll for the assistant's response.
    """
    thread_id = request.threadId
    message = request.message
    file_id = request.file_id

    if not thread_id or not message:
        raise HTTPException(status_code=400, detail="Invalid input")

    # Add the message
    message_response = await add_message(thread_id, message, file_id)

    # Run the assistant
    run = await run_assistant(thread_id)
    run_id = run.id

    # Background task to poll the status
    """"def poll_for_response():
        messages = asyncio.run(check_status(thread_id, run_id))
        return messages """""
        # could store the response in a database or notify the user in real-time

    response = await check_status(thread_id, run_id)

    return {
        "messageId": message_response.id,
        "response": response,
    }

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF file. The file is saved to the 'uploads' directory.
    """
    if file.size > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File too large.")

    # Validate the uploaded file is a PDF
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        file_id = await upload_file_to_openai(file)
        return {"file_id": file_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

