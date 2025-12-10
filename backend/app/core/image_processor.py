"""
Advanced Image Processing Service for AveoEarth
Handles compression, optimization, and verification of vendor uploads
"""

import os
import io
import asyncio
from typing import List, Dict, Optional, Tuple, Union
from PIL import Image, ImageOps, ImageEnhance
try:
    import pillow_avif  # For AVIF support
    AVIF_SUPPORT = True
except ImportError:
    AVIF_SUPPORT = False
from fastapi import UploadFile, HTTPException
import aiofiles
import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Advanced image processing with compression and optimization"""
    
    def __init__(self):
        self.supported_formats = ['JPEG', 'PNG', 'WEBP', 'AVIF']
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.quality_levels = {
            'thumbnail': {'size': (150, 150), 'quality': 85},
            'small': {'size': (400, 400), 'quality': 90},
            'medium': {'size': (800, 800), 'quality': 85},
            'large': {'size': (1200, 1200), 'quality': 80},
            'original': {'size': None, 'quality': 75}
        }
        
    async def process_vendor_image(
        self, 
        file: UploadFile, 
        vendor_id: str,
        product_id: str,
        compression_level: str = 'auto'
    ) -> Dict[str, any]:
        """
        Process vendor uploaded image with compression and optimization
        
        Args:
            file: Uploaded image file
            vendor_id: Vendor identifier
            product_id: Product identifier
            compression_level: Compression level (auto, high, medium, low)
            
        Returns:
            Dict containing processed image data and metadata
        """
        try:
            # Validate file
            await self._validate_image(file)
            
            # Read image data
            image_data = await file.read()
            original_size = len(image_data)
            
            # Open image with PIL
            image = Image.open(io.BytesIO(image_data))
            
            # Auto-detect compression level if needed
            if compression_level == 'auto':
                compression_level = self._auto_detect_compression(image, original_size)
            
            # Process image for different sizes
            processed_images = {}
            
            for size_name, config in self.quality_levels.items():
                processed_image = await self._process_image_size(
                    image, size_name, config, compression_level
                )
                processed_images[size_name] = processed_image
            
            # Generate image hash for deduplication
            image_hash = self._generate_image_hash(image_data)
            
            # Calculate compression ratio
            compressed_size = sum(len(img['data']) for img in processed_images.values())
            compression_ratio = (1 - compressed_size / original_size) * 100
            
            # Generate metadata
            metadata = {
                'original_size': original_size,
                'compressed_size': compressed_size,
                'compression_ratio': compression_ratio,
                'image_hash': image_hash,
                'format': image.format,
                'dimensions': image.size,
                'color_mode': image.mode,
                'vendor_id': vendor_id,
                'product_id': product_id,
                'processed_at': asyncio.get_event_loop().time()
            }
            
            logger.info(f"Image processed: {compression_ratio:.1f}% compression achieved")
            
            return {
                'images': processed_images,
                'metadata': metadata,
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")
    
    async def _validate_image(self, file: UploadFile) -> None:
        """Validate uploaded image file"""
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Check file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        await file.seek(0)  # Reset file pointer
        
        if file_size > self.max_file_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File size {file_size / 1024 / 1024:.1f}MB exceeds maximum {self.max_file_size / 1024 / 1024:.1f}MB"
            )
        
        # Validate image format
        try:
            image = Image.open(io.BytesIO(content))
            if image.format not in self.supported_formats:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported format. Supported: {', '.join(self.supported_formats)}"
                )
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image file")
    
    def _auto_detect_compression(self, image: Image.Image, file_size: int) -> str:
        """Auto-detect optimal compression level based on image characteristics"""
        width, height = image.size
        total_pixels = width * height
        
        # High compression for large images
        if total_pixels > 2000000 or file_size > 5 * 1024 * 1024:  # 2MP or 5MB
            return 'high'
        elif total_pixels > 1000000 or file_size > 2 * 1024 * 1024:  # 1MP or 2MB
            return 'medium'
        else:
            return 'low'
    
    async def _process_image_size(
        self, 
        image: Image.Image, 
        size_name: str, 
        config: Dict, 
        compression_level: str
    ) -> Dict:
        """Process image for specific size with optimization"""
        
        # Resize image if needed
        if config['size']:
            image = self._smart_resize(image, config['size'])
        
        # Apply compression based on level
        quality = self._get_quality_for_level(config['quality'], compression_level)
        
        # Optimize image
        optimized_image = self._optimize_image(image, quality)
        
        # Convert to bytes
        output = io.BytesIO()
        
        # Choose best format based on compression level
        if compression_level == 'high' and AVIF_SUPPORT:
            # Use AVIF for maximum compression
            optimized_image.save(output, format='AVIF', quality=quality, lossless=False)
        elif compression_level == 'medium':
            # Use WebP for good compression
            optimized_image.save(output, format='WEBP', quality=quality, method=6)
        else:
            # Use JPEG for compatibility
            if optimized_image.mode in ('RGBA', 'LA', 'P'):
                optimized_image = optimized_image.convert('RGB')
            optimized_image.save(output, format='JPEG', quality=quality, optimize=True)
        
        return {
            'data': output.getvalue(),
            'size': len(output.getvalue()),
            'format': output.getvalue()[:4],  # First 4 bytes for format detection
            'dimensions': optimized_image.size
        }
    
    def _smart_resize(self, image: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
        """Smart resize maintaining aspect ratio and quality"""
        # Calculate new dimensions maintaining aspect ratio
        width, height = image.size
        target_width, target_height = target_size
        
        # Calculate scaling factor
        scale_w = target_width / width
        scale_h = target_height / height
        scale = min(scale_w, scale_h)
        
        new_width = int(width * scale)
        new_height = int(height * scale)
        
        # Use high-quality resampling
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Center crop if needed
        if new_width != target_width or new_height != target_height:
            left = (new_width - target_width) // 2
            top = (new_height - target_height) // 2
            right = left + target_width
            bottom = top + target_height
            resized = resized.crop((left, top, right, bottom))
        
        return resized
    
    def _optimize_image(self, image: Image.Image, quality: int) -> Image.Image:
        """Apply various optimizations to reduce file size"""
        
        # Convert to RGB if needed (for JPEG compatibility)
        if image.mode in ('RGBA', 'LA'):
            # Create white background for transparency
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'RGBA':
                background.paste(image, mask=image.split()[-1])
            else:
                background.paste(image)
            image = background
        elif image.mode == 'P':
            image = image.convert('RGB')
        
        # Auto-orient based on EXIF data
        image = ImageOps.exif_transpose(image)
        
        # Enhance contrast slightly for better compression
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.05)
        
        # Reduce color palette for better compression
        if image.mode == 'RGB':
            # Quantize colors for better compression
            image = image.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
            image = image.convert('RGB')
        
        return image
    
    def _get_quality_for_level(self, base_quality: int, compression_level: str) -> int:
        """Get quality setting based on compression level"""
        quality_map = {
            'high': int(base_quality * 0.7),    # 70% of base quality
            'medium': int(base_quality * 0.85), # 85% of base quality
            'low': base_quality                 # Full quality
        }
        return quality_map.get(compression_level, base_quality)
    
    def _generate_image_hash(self, image_data: bytes) -> str:
        """Generate hash for image deduplication"""
        return hashlib.sha256(image_data).hexdigest()
    
    async def batch_process_images(
        self, 
        files: List[UploadFile], 
        vendor_id: str, 
        product_id: str
    ) -> Dict[str, any]:
        """Process multiple images in batch"""
        results = []
        
        for i, file in enumerate(files):
            try:
                result = await self.process_vendor_image(
                    file, vendor_id, f"{product_id}_{i}"
                )
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to process image {i}: {str(e)}")
                results.append({
                    'error': str(e),
                    'filename': file.filename,
                    'success': False
                })
        
        return {
            'results': results,
            'total_processed': len([r for r in results if r.get('success', False)]),
            'total_failed': len([r for r in results if not r.get('success', False)])
        }
    
    def get_compression_stats(self, original_size: int, compressed_size: int) -> Dict:
        """Calculate compression statistics"""
        compression_ratio = (1 - compressed_size / original_size) * 100
        space_saved = original_size - compressed_size
        
        return {
            'compression_ratio': compression_ratio,
            'space_saved_bytes': space_saved,
            'space_saved_mb': space_saved / (1024 * 1024),
            'efficiency_score': min(100, compression_ratio * 1.2)  # Score out of 100
        }

# Global instance
image_processor = ImageProcessor()
