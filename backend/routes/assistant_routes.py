from fastapi import APIRouter, HTTPException, File, UploadFile, BackgroundTasks
from models.message_request_model import MessageRequest
from services.openai_service import (
    create_thread,
    add_message,
    run_assistant,
    check_status,
    upload_file_to_openai
)
from services.file_service import validate_file

assistant_router = APIRouter()

@assistant_router.get("/thread")
async def thread_route():
    # Endpoint to create a new thread
    threadId = await create_thread()
    return {
        "threadId": threadId.id
    }

@assistant_router.post("/message")
async def message_route(request: MessageRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to add a message to a thread and run the assistant.
    Uses a background task to poll for the assistant's response.
    """
    thread_id = request.threadId
    message = request.message
    file_id = request.fileId

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

@assistant_router.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF file.
    """
    validate_file(file)

    try:
        file_id = await upload_file_to_openai(file)
        return {"file_id": file_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
