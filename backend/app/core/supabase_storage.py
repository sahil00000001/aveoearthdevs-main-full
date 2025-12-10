from supabase import create_client, Client
from typing import Optional, Union, BinaryIO
import uuid
import os
from PIL import Image
from io import BytesIO
from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import ValidationException

logger = get_logger("supabase_storage")

class SupabaseStorageClient:
    def __init__(self):
        self._client: Optional[Client] = None
    
    @property
    def client(self) -> Client:
        if self._client is None:
            if not settings.SUPABASE_URL:
                raise ValidationException("SUPABASE_URL must be set in environment variables")
            if not settings.SUPABASE_SERVICE_ROLE_KEY:
                raise ValidationException("SUPABASE_SERVICE_ROLE_KEY must be set in environment variables for storage operations")
            
            try:
                self._client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                # Test connection by attempting to list buckets
                try:
                    self._client.storage.list_buckets()
                except Exception as e:
                    logger.error(f"Supabase storage authentication failed. Please verify SUPABASE_SERVICE_ROLE_KEY is correct: {str(e)}")
                    raise ValidationException(f"Supabase storage authentication failed. Please check your SUPABASE_SERVICE_ROLE_KEY: {str(e)}")
            except ValidationException:
                raise
            except Exception as e:
                logger.error(f"Failed to initialize Supabase storage client: {str(e)}")
                raise ValidationException(f"Failed to initialize Supabase storage: {str(e)}")
        return self._client
    
    def upload_file(
        self,
        bucket_name: str,
        file_path: str,
        file_data: Union[bytes, BinaryIO],
        content_type: Optional[str] = None,
        public: bool = True
    ) -> str:
        """
        Upload a file to Supabase Storage
        """
        try:
            # Ensure bucket exists
            self._ensure_bucket_exists(bucket_name)
            
            # Upload file
            response = self.client.storage.from_(bucket_name).upload(
                file_path,
                file_data,
                file_options={
                    "content-type": content_type,
                    "upsert": "true"
                }
            )
            
            if public:
                # Make file public
                self.client.storage.from_(bucket_name).update_public_access(file_path, "true")
            
            # Get public URL
            public_url = self.client.storage.from_(bucket_name).get_public_url(file_path)
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload file to Supabase Storage: {str(e)}")
            raise ValidationException(f"Failed to upload file: {str(e)}")
    
    def delete_file(self, bucket_name: str, file_path: str) -> bool:
        """
        Delete a file from Supabase Storage
        """
        try:
            self.client.storage.from_(bucket_name).remove([file_path])
            return True
        except Exception as e:
            logger.error(f"Failed to delete file from Supabase Storage: {str(e)}")
            return False
    
    def get_public_url(self, bucket_name: str, file_path: str) -> str:
        """
        Get public URL for a file
        """
        try:
            return self.client.storage.from_(bucket_name).get_public_url(file_path)
        except Exception as e:
            logger.error(f"Failed to get public URL: {str(e)}")
            raise ValidationException(f"Failed to get public URL: {str(e)}")
    
    def _ensure_bucket_exists(self, bucket_name: str):
        """
        Ensure bucket exists in Supabase Storage
        """
        try:
            # List buckets to check if it exists
            buckets = self.client.storage.list_buckets()
            bucket_names = [bucket.name for bucket in buckets] if buckets else []
            
            if bucket_name not in bucket_names:
                # Create bucket if it doesn't exist
                try:
                    self.client.storage.create_bucket(bucket_name)
                    logger.info(f"Created bucket: {bucket_name}")
                except Exception as create_error:
                    # If bucket creation fails, it might already exist or we don't have permissions
                    logger.warning(f"Could not create bucket {bucket_name}: {str(create_error)}")
                    # Try to continue - bucket might exist but not be listed
        except Exception as e:
            error_msg = str(e)
            if "signature verification failed" in error_msg or "Unauthorized" in error_msg or "403" in error_msg:
                logger.error(f"Supabase storage authentication failed for bucket '{bucket_name}'. Please verify SUPABASE_SERVICE_ROLE_KEY is correct and has storage permissions.")
            else:
                logger.warning(f"Could not ensure bucket exists: {str(e)}")
    
    def upload_image(
        self,
        bucket_name: str,
        file_path: str,
        image_data: Union[bytes, BinaryIO],
        max_width: int = 1920,
        max_height: int = 1080,
        quality: int = 85
    ) -> str:
        """
        Upload and optimize an image to Supabase Storage
        """
        try:
            # Open and process image
            if isinstance(image_data, bytes):
                image = Image.open(BytesIO(image_data))
            else:
                image = Image.open(image_data)
            
            # Resize if needed
            if image.width > max_width or image.height > max_height:
                image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Save optimized image
            output = BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            
            # Upload optimized image
            return self.upload_file(
                bucket_name,
                file_path,
                output.getvalue(),
                content_type='image/jpeg',
                public=True
            )
            
        except Exception as e:
            logger.error(f"Failed to upload image: {str(e)}")
            raise ValidationException(f"Failed to upload image: {str(e)}")
    
    def list_files(self, bucket_name: str, folder_path: str = "") -> list:
        """
        List files in a bucket folder
        """
        try:
            files = self.client.storage.from_(bucket_name).list(folder_path)
            return files
        except Exception as e:
            logger.error(f"Failed to list files: {str(e)}")
            return []
    
    def get_file_info(self, bucket_name: str, file_path: str) -> dict:
        """
        Get file information
        """
        try:
            files = self.client.storage.from_(bucket_name).list(os.path.dirname(file_path))
            file_name = os.path.basename(file_path)
            
            for file in files:
                if file['name'] == file_name:
                    return file
            
            return {}
        except Exception as e:
            logger.error(f"Failed to get file info: {str(e)}")
            return {}


# Convenience functions for backward compatibility
def upload_user_avatar(avatar_file, user_id: str) -> str:
    """
    Upload user avatar to Supabase Storage
    """
    storage_client = SupabaseStorageClient()
    file_path = f"avatars/{user_id}/{uuid.uuid4()}.jpg"
    
    return storage_client.upload_image(
        bucket_name="user-uploads",
        file_path=file_path,
        image_data=avatar_file.file.read(),
        max_width=512,
        max_height=512,
        quality=90
    )

def delete_file_from_url(file_url: str) -> bool:
    """
    Delete file from Supabase Storage using its URL
    """
    try:
        # Extract bucket and file path from URL
        # Supabase URLs are typically: https://project.supabase.co/storage/v1/object/public/bucket/path
        if "supabase.co/storage/v1/object/public/" in file_url:
            parts = file_url.split("/storage/v1/object/public/")
            if len(parts) == 2:
                bucket_and_path = parts[1]
                bucket_name = bucket_and_path.split("/")[0]
                file_path = "/".join(bucket_and_path.split("/")[1:])
                
                storage_client = SupabaseStorageClient()
                return storage_client.delete_file(bucket_name, file_path)
    except Exception as e:
        logger.error(f"Failed to delete file from URL: {str(e)}")
        return False
    
    return False

def extract_blob_path_from_url(file_url: str) -> tuple:
    """
    Extract bucket name and file path from Supabase Storage URL
    Returns (bucket_name, file_path)
    """
    try:
        if "supabase.co/storage/v1/object/public/" in file_url:
            parts = file_url.split("/storage/v1/object/public/")
            if len(parts) == 2:
                bucket_and_path = parts[1]
                bucket_name = bucket_and_path.split("/")[0]
                file_path = "/".join(bucket_and_path.split("/")[1:])
                return (bucket_name, file_path)
    except Exception as e:
        logger.error(f"Failed to extract blob path from URL: {str(e)}")
    
    return (None, None)

def list_images(bucket_name: str, folder_path: str = "") -> list:
    """
    List images in a bucket folder
    """
    storage_client = SupabaseStorageClient()
    return storage_client.list_files(bucket_name, folder_path)

def upload_product_image(image_file, supplier_id: str) -> str:
    """
    Upload product image to Supabase Storage
    """
    storage_client = SupabaseStorageClient()
    file_path = f"products/{supplier_id}/{uuid.uuid4()}.jpg"
    
    return storage_client.upload_image(
        bucket_name="product-assets",
        file_path=file_path,
        image_data=image_file.file.read(),
        max_width=1920,
        max_height=1080,
        quality=85
    )

def validate_image_file(image_file) -> bool:
    """
    Validate image file
    """
    if not image_file or not image_file.filename:
        raise ValidationException("No image file provided")
    
    # Check file extension
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    file_extension = os.path.splitext(image_file.filename.lower())[1]
    
    if file_extension not in allowed_extensions:
        raise ValidationException(f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
    
    # Check file size (max 10MB)
    if hasattr(image_file, 'size') and image_file.size > 10 * 1024 * 1024:
        raise ValidationException("File size too large. Maximum 10MB allowed")
    
    return True
