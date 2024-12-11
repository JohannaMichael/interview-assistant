from pydantic import BaseModel
from typing import Optional

# Request model for the /message endpoint
class MessageRequest(BaseModel):
    threadId: str
    message: str
    fileId: Optional[str] = None