from fastapi import UploadFile, HTTPException

def validate_file(file: UploadFile):

    BLOCKED_EXTENSIONS = [".exe", ".sh", ".bat"]

    if any(file.filename.endswith(ext) for ext in BLOCKED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Executable files are not allowed.")

    if file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large.")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
