from fastapi import UploadFile, HTTPException
from services.file_service import validate_file
from io import BytesIO
import pytest

def test_validate_file_valid():
    headers = {
            "content-type":"application/pdf"
          }
    mock_file = UploadFile(
        filename="test.pdf",
        file=BytesIO(b"PDF content"),
        headers=headers
    )
    mock_file.size = 1024 * 1024
    validate_file(mock_file)

def test_validate_file_large_file():
    headers = {
            "content-type":"application/pdf"
          }
    mock_file = UploadFile(
        filename="large.pdf",
        file=BytesIO(b"PDF content"),
        headers=headers
    )
    mock_file.size = 11 * 1024 * 1024  # 11 MB

    with pytest.raises(HTTPException) as exc:
        validate_file(mock_file)

    assert exc.value.status_code == 413
    assert exc.value.detail == "File too large."

def test_validate_file_invalid_content_type():
    headers = {
            "content-type":"text/plain"
          }
    mock_file = UploadFile(
        filename="test.txt",
        file=BytesIO(b"Text content"),
        headers=headers
    )
    mock_file.size = 1024  # 1 KB

    with pytest.raises(HTTPException) as exc:
        validate_file(mock_file)

    assert exc.value.status_code == 400
    assert exc.value.detail == "Only PDF files are allowed."


def test_validate_file_invalid_extension():
    headers = {
            "content-type":"application/pdf"
          }

    mock_file = UploadFile(
        filename="test.exe",
        file=BytesIO(b"Text content"),
        headers=headers
    )

    with pytest.raises(HTTPException) as exc:
        validate_file(mock_file)

    assert exc.value.status_code == 400
    assert exc.value.detail == "Executable files are not allowed."