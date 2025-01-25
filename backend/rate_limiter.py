from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)

async def rate_limit_error_handler(request: Request, exc: RateLimitExceeded):
    return {
        "status_code" : 429,
        "detail" : "Rate limit exceeded. Please try again later."
    }
