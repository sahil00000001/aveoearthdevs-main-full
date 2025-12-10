from google.cloud import storage
from google.oauth2 import service_account
from typing import Optional, Union, BinaryIO
import uuid
import os
from PIL import Image
from io import BytesIO
from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import ValidationException

logger = get_logger("gcp_storage")

class GCPStorageClient:
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            credentials_dict = settings.gcp_credentials_dict.copy()
            if 'private_key' in credentials_dict:
                credentials_dict['private_key'] = credentials_dict['private_key'].replace('\\n', '\n')
            
            credentials = service_account.Credentials.from_service_account_info(
                credentials_dict
            )
            project_id = credentials_dict.get('project_id', settings.GCP_PROJECT_ID)
            self._client = storage.Client(
                project=project_id,
                credentials=credentials
            )
        return self._client
    
    def _ensure_buckets_exist(self):
        bucket_names = [
            settings.GCP_BUCKET_SUPPLIER_ASSETS,
            settings.GCP_BUCKET_PRODUCT_ASSETS,
            settings.GCP_BUCKET_CATEGORY_ASSETS,
            settings.GCP_BUCKET_USER_UPLOADS
        ]
        
        for bucket_name in bucket_names:
            bucket = self.client.bucket(bucket_name)
            if not bucket.exists():
                bucket = self.client.create_bucket(bucket_name, location="us-east1")
    
    def get_bucket(self, bucket_name: str):
        return self.client.bucket(bucket_name)
    
    def upload_file(
        self,
        file_content: Union[bytes, BinaryIO],
        bucket_name: str,
        blob_path: str,
        content_type: Optional[str] = None
    ) -> str:
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(blob_path)
        
        if hasattr(file_content, 'read'):
            blob.upload_from_file(file_content, content_type=content_type)
        else:
            blob.upload_from_string(file_content, content_type=content_type)
        
        from datetime import timedelta
        try:
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(days=3650),
                method="GET"
            )
            return signed_url
        except:
            return f"{settings.GCP_CDN_BASE_URL}/{bucket_name}/{blob_path}?access_token={self._generate_access_token()}"
    
    def delete_file(self, bucket_name: str, blob_path: str) -> bool:
        try:
            bucket = self.get_bucket(bucket_name)
            blob = bucket.blob(blob_path)
            blob.delete()
            return True
        except Exception as e:
            logger.error(f"Failed to delete {blob_path} from {bucket_name}: {e}")
            return False
    
    def file_exists(self, bucket_name: str, blob_path: str) -> bool:
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(blob_path)
        return blob.exists()
    
    def _generate_access_token(self) -> str:
        from google.auth.transport.requests import Request
        from google.oauth2 import service_account
        
        credentials_dict = settings.gcp_credentials_dict.copy()
        credentials_dict['private_key'] = credentials_dict['private_key'].replace('\\n', '\n')
        
        credentials = service_account.Credentials.from_service_account_info(
            credentials_dict,
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        
        request = Request()
        credentials.refresh(request)
        return credentials.token

_storage_client = None

def get_storage_client() -> GCPStorageClient:
    global _storage_client
    if _storage_client is None:
        _storage_client = GCPStorageClient()
    return _storage_client

def validate_image_file(file, max_size: int = 10 * 1024 * 1024):
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if file.content_type not in allowed_types:
        raise ValidationException(f"Invalid file type. Allowed: {allowed_types}")
    
    if hasattr(file, 'size') and file.size > max_size:
        raise ValidationException(f"File too large. Max size: {max_size} bytes")

def get_safe_filename(user_id: str, original_filename: str, prefix: str = "") -> str:
    file_ext = os.path.splitext(original_filename)[1].lower()
    safe_name = f"{prefix}_{user_id}_{uuid.uuid4().hex}{file_ext}" if prefix else f"{user_id}_{uuid.uuid4().hex}{file_ext}"
    return safe_name.replace("__", "_")

def resize_image(image_content: bytes, max_width: int = 1920, max_height: int = 1080, quality: int = 85) -> bytes:
    image = Image.open(BytesIO(image_content))
    
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGB')
    
    image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    
    output = BytesIO()
    image.save(output, format='JPEG', quality=quality, optimize=True)
    return output.getvalue()

async def upload_supplier_logo(file, user_id: str) -> str:
    validate_image_file(file)
    content = await file.read()
    resized_content = resize_image(content, 400, 400)
    filename = get_safe_filename(user_id, file.filename, "logo")
    path = f"logos/{filename}"
    client = get_storage_client()
    return client.upload_file(resized_content, settings.GCP_BUCKET_SUPPLIER_ASSETS, path, "image/jpeg")

async def upload_supplier_banner(file, user_id: str) -> str:
    validate_image_file(file)
    content = await file.read()
    resized_content = resize_image(content, 1920, 600)
    filename = get_safe_filename(user_id, file.filename, "banner")
    path = f"banners/{filename}"
    client = get_storage_client()
    return client.upload_file(resized_content, settings.GCP_BUCKET_SUPPLIER_ASSETS, path, "image/jpeg")

async def upload_supplier_document(file, user_id: str, doc_type: str) -> str:
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise ValidationException(f"Invalid document type. Allowed: {allowed_types}")
    
    content = await file.read()
    filename = get_safe_filename(user_id, file.filename, doc_type)
    path = f"documents/{doc_type}/{filename}"
    client = get_storage_client()
    return client.upload_file(content, settings.GCP_BUCKET_SUPPLIER_ASSETS, path, file.content_type)

async def upload_product_image(file, user_id: str) -> str:
    validate_image_file(file)
    content = await file.read()
    resized_content = resize_image(content, 1200, 1200)
    filename = get_safe_filename(user_id, file.filename, "product")
    path = f"products/{filename}"
    client = get_storage_client()
    return client.upload_file(resized_content, settings.GCP_BUCKET_PRODUCT_ASSETS, path, "image/jpeg")

async def upload_category_image(file, user_id: str) -> str:
    validate_image_file(file)
    content = await file.read()
    resized_content = resize_image(content, 600, 400)
    filename = get_safe_filename(user_id, file.filename, "category")
    path = f"categories/{filename}"
    client = get_storage_client()
    return client.upload_file(resized_content, settings.GCP_BUCKET_CATEGORY_ASSETS, path, "image/jpeg")

async def upload_category_icon(file, user_id: str) -> str:
    validate_image_file(file)
    content = await file.read()
    resized_content = resize_image(content, 100, 100)
    filename = get_safe_filename(user_id, file.filename, "icon")
    path = f"icons/{filename}"
    client = get_storage_client()
    return client.upload_file(resized_content, settings.GCP_BUCKET_CATEGORY_ASSETS, path, "image/jpeg")

async def upload_user_avatar(file, user_id: str) -> str:
    validate_image_file(file)
    content = await file.read()
    resized_content = resize_image(content, 300, 300)
    filename = get_safe_filename(user_id, file.filename, "avatar")
    path = f"avatars/{filename}"
    client = get_storage_client()
    return client.upload_file(resized_content, settings.GCP_BUCKET_USER_UPLOADS, path, "image/jpeg")

def delete_file_from_url(file_url: str) -> bool:
    try:
        if not file_url or settings.GCP_CDN_BASE_URL not in file_url:
            return False
        
        url_parts = file_url.replace(f"{settings.GCP_CDN_BASE_URL}/", "").split("/", 1)
        if len(url_parts) != 2:
            return False
        
        bucket_name, blob_path = url_parts
        client = get_storage_client()
        return client.delete_file(bucket_name, blob_path)
    except Exception as e:
        logger.error(f"Failed to delete file from URL {file_url}: {e}")
        return False

def extract_blob_path_from_url(file_url: str) -> tuple[str, str]:
    if not file_url or settings.GCP_CDN_BASE_URL not in file_url:
        return "", ""
    
    url_without_params = file_url.split('?')[0]
    
    url_parts = url_without_params.replace(f"{settings.GCP_CDN_BASE_URL}/", "").split("/", 1)
    if len(url_parts) != 2:
        return "", ""
    
    return url_parts[0], url_parts[1]

def upload_brand_logo(file, brand_id: str) -> str:
    validate_image_file(file)
    import uuid
    blob_path = f"brand-logos/logo_{brand_id}_{uuid.uuid4().hex}.{file.filename.split('.')[-1]}"
    client = get_storage_client()
    return client.upload_file(file.file, settings.GCP_BUCKET_PRODUCT_ASSETS, blob_path, file.content_type)

def list_images(bucket_name: str, prefix: str = "") -> list:
    from datetime import timedelta
    storage_client = get_storage_client()
    bucket = storage_client.get_bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=prefix)
    images = []
    for blob in blobs:
        if not blob.name.endswith("/"):
            image_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(days=7),
                method="GET"
            )
            images.append({
                "name": blob.name,
                "url": image_url,
                "size": blob.size or 0,
                "created_at": blob.time_created.isoformat() if blob.time_created else None,
                "updated_at": blob.updated.isoformat() if blob.updated else None
            })
    return images

def list_bucket_files(bucket_name: str) -> list:
    storage_client = get_storage_client()
    bucket = storage_client.get_bucket(bucket_name)
    files = [{"name": blob.name} for blob in bucket.list_blobs()]
    return files

def delete_bucket_file(bucket_name: str, filename: str) -> bool:
    storage_client = get_storage_client()
    return storage_client.delete_file(bucket_name, filename)

def delete_multiple_files(bucket_name: str, filenames: list) -> bool:
    storage_client = get_storage_client()
    for filename in filenames:
        storage_client.delete_file(bucket_name, filename)
    return True