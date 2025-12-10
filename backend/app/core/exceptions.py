from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class AveoException(HTTPException):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.details = details or {}
        super().__init__(status_code=status_code, detail=message)

class ValidationException(AveoException):
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY, details)

class AuthenticationException(AveoException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class AuthorizationException(AveoException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class NotFoundException(AveoException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class ConflictException(AveoException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)

class RateLimitException(AveoException):
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, status.HTTP_429_TOO_MANY_REQUESTS)

class ServiceUnavailableException(AveoException):
    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(message, status.HTTP_503_SERVICE_UNAVAILABLE)

class ExternalServiceException(AveoException):
    def __init__(self, message: str = "External service error", service: str = ""):
        super().__init__(f"{service}: {message}" if service else message, status.HTTP_502_BAD_GATEWAY)

class BadRequestException(AveoException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)
