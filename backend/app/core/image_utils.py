from typing import Optional, List
from fastapi import UploadFile
from app.core.exceptions import ValidationException
from app.core.logging import get_logger

logger = get_logger("image_utils")

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB in bytes

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp",
    "image/gif"
}

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "text/plain"
}

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt"}

def validate_file_size(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> None:
    if not hasattr(file, 'size') or file.size is None:
        return
    
    if file.size > max_size:
        size_mb = max_size / (1024 * 1024)
        raise ValidationException(f"File size must be less than {size_mb}MB")

def validate_image_file(file: UploadFile) -> None:
    if not file or not file.filename:
        raise ValidationException("Filename is required")
    
    validate_file_size(file)
    
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationException("Only image files (JPEG, PNG, WebP, GIF) are allowed")
    
    file_extension = get_file_extension(file.filename)
    if file_extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationException("Invalid image file extension")

def validate_document_file(file: UploadFile) -> None:
    if not file or not file.filename:
        raise ValidationException("Filename is required")
    
    validate_file_size(file)
    
    if not file.content_type or file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise ValidationException("Document type not allowed. Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT")
    
    file_extension = get_file_extension(file.filename)
    if file_extension not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise ValidationException("Invalid document file extension")

def get_file_extension(filename: str) -> str:
    return "." + filename.split(".")[-1].lower() if "." in filename else ""

def validate_multiple_files(files: List[UploadFile], file_type: str = "document") -> None:
    if not files:
        raise ValidationException("At least one file is required")
    
    for i, file in enumerate(files):
        try:
            if file_type == "image":
                validate_image_file(file)
            else:
                validate_document_file(file)
        except ValidationException as e:
            raise ValidationException(f"File {i+1} ({file.filename}): {str(e)}")

def get_safe_filename(user_id: str, original_filename: str, prefix: str = "") -> str:
    extension = get_file_extension(original_filename)
    safe_name = original_filename.replace(" ", "_").replace("/", "_").replace("\\", "_")
    
    if prefix:
        return f"{prefix}/{user_id}/{safe_name}"
    return f"{user_id}/{safe_name}"
