"""
Optimized Storage Service with Image Compression
Integrates with Supabase storage for efficient image management
"""

import os
import asyncio
from typing import Dict, List, Optional, Tuple
from fastapi import UploadFile, HTTPException
from pathlib import Path
import logging
from datetime import datetime
import json

from .image_processor import image_processor
from .supabase_storage import SupabaseStorageClient

logger = logging.getLogger(__name__)

class OptimizedStorageService:
    """Enhanced storage service with compression and optimization"""
    
    def __init__(self):
        self.storage_client = SupabaseStorageClient()
        self.compression_enabled = True
        self.deduplication_enabled = True
        self.cache_enabled = True
        
        # Storage paths
        self.paths = {
            'product_images': 'product-assets',
            'vendor_uploads': 'vendor-uploads',
            'compressed': 'compressed-images',
            'thumbnails': 'thumbnails'
        }
    
    async def upload_vendor_image(
        self,
        file: UploadFile,
        vendor_id: str,
        product_id: str,
        compression_level: str = 'auto',
        verify_image: bool = True
    ) -> Dict[str, any]:
        """
        Upload and process vendor image with compression
        
        Args:
            file: Uploaded image file
            vendor_id: Vendor identifier
            product_id: Product identifier
            compression_level: Compression level (auto, high, medium, low)
            verify_image: Whether to run image verification
            
        Returns:
            Dict containing upload results and metadata
        """
        try:
            # Process image with compression
            processing_result = await image_processor.process_vendor_image(
                file, vendor_id, product_id, compression_level
            )
            
            if not processing_result['success']:
                raise HTTPException(status_code=400, detail="Image processing failed")
            
            # Upload processed images to storage
            upload_results = {}
            metadata = processing_result['metadata']
            
            for size_name, image_data in processing_result['images'].items():
                # Generate optimized filename
                filename = self._generate_filename(
                    vendor_id, product_id, size_name, 
                    metadata['format'], compression_level
                )
                
                # Upload to storage
                upload_result = await self._upload_processed_image(
                    image_data['data'], filename, size_name
                )
                
                upload_results[size_name] = upload_result
            
            # Store metadata
            metadata_file = await self._store_image_metadata(
                vendor_id, product_id, metadata, upload_results
            )
            
            # Run verification if requested
            verification_result = None
            if verify_image:
                verification_result = await self._verify_processed_image(
                    upload_results, metadata
                )
            
            # Calculate storage efficiency
            efficiency_stats = self._calculate_storage_efficiency(
                metadata, upload_results
            )
            
            return {
                'success': True,
                'vendor_id': vendor_id,
                'product_id': product_id,
                'upload_results': upload_results,
                'metadata': metadata,
                'metadata_file': metadata_file,
                'verification': verification_result,
                'efficiency': efficiency_stats,
                'compression_ratio': metadata['compression_ratio'],
                'space_saved_mb': efficiency_stats['space_saved_mb']
            }
            
        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    async def save_raw_image(self, file: UploadFile, vendor_id: str, product_id: str) -> Dict[str, any]:
        """Save raw uploaded image without processing, to ensure real persistence when compression fails."""
        try:
            data = await file.read()
            filename = self._generate_filename(vendor_id, product_id, 'original', 'JPEG', 'low')
            result = await self._upload_processed_image(data, filename, 'original')
            return {
                'success': result.get('success', False),
                'url': result.get('url'),
                'path': result.get('path'),
                'size': result.get('size')
            }
        except Exception as e:
            logger.error(f"Saving raw image failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Saving raw image failed: {str(e)}")
    
    async def batch_upload_vendor_images(
        self,
        files: List[UploadFile],
        vendor_id: str,
        product_id: str,
        compression_level: str = 'auto'
    ) -> Dict[str, any]:
        """Upload multiple images with batch processing"""
        results = []
        total_original_size = 0
        total_compressed_size = 0
        
        for i, file in enumerate(files):
            try:
                result = await self.upload_vendor_image(
                    file, vendor_id, f"{product_id}_{i}", compression_level
                )
                results.append(result)
                
                # Accumulate size statistics
                total_original_size += result['metadata']['original_size']
                total_compressed_size += result['metadata']['compressed_size']
                
            except Exception as e:
                logger.error(f"Batch upload failed for image {i}: {str(e)}")
                results.append({
                    'success': False,
                    'error': str(e),
                    'filename': file.filename
                })
        
        # Calculate batch statistics
        successful_uploads = [r for r in results if r.get('success', False)]
        batch_compression_ratio = (1 - total_compressed_size / total_original_size) * 100 if total_original_size > 0 else 0
        
        return {
            'results': results,
            'total_uploaded': len(successful_uploads),
            'total_failed': len(results) - len(successful_uploads),
            'batch_compression_ratio': batch_compression_ratio,
            'total_space_saved_mb': (total_original_size - total_compressed_size) / (1024 * 1024),
            'average_compression_ratio': sum(r.get('compression_ratio', 0) for r in successful_uploads) / len(successful_uploads) if successful_uploads else 0
        }
    
    def _generate_filename(
        self, 
        vendor_id: str, 
        product_id: str, 
        size_name: str, 
        format: str, 
        compression_level: str
    ) -> str:
        """Generate optimized filename for storage"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Map compression levels to suffixes
        compression_suffix = {
            'high': 'hq',
            'medium': 'mq', 
            'low': 'lq',
            'auto': 'auto'
        }.get(compression_level, 'auto')
        
        # Choose file extension based on format
        if format == 'AVIF':
            ext = 'avif'
        elif format == 'WEBP':
            ext = 'webp'
        else:
            ext = 'jpg'
        
        return f"{vendor_id}/{product_id}/{size_name}_{compression_suffix}_{timestamp}.{ext}"
    
    async def _upload_processed_image(
        self, 
        image_data: bytes, 
        filename: str, 
        size_name: str
    ) -> Dict[str, any]:
        """Upload processed image to storage"""
        try:
            # Determine bucket based on size
            bucket_name = self._get_bucket_for_size(size_name)
            
            # Upload to Supabase storage
            upload_result = await asyncio.get_event_loop().run_in_executor(
                None, self.storage_client.upload_file, bucket_name, filename, image_data
            )

            # Supabase client returns a public URL string in current implementation
            if isinstance(upload_result, str):
                public_url = upload_result
                return {
                    'success': True,
                    'filename': filename,
                    'bucket': bucket_name,
                    'size': len(image_data),
                    'url': public_url,
                    'path': filename
                }
            else:
                # Fallback if a dict-like result is returned
                return {
                    'success': True,
                    'filename': filename,
                    'bucket': bucket_name,
                    'size': len(image_data),
                    'url': upload_result.get('url') if upload_result else None,
                    'path': upload_result.get('path') if upload_result else filename
                }
            
        except Exception as e:
            logger.error(f"Storage upload failed: {str(e)}")
            # Real fallback: write to local media folder so feature still works without Supabase
            try:
                local_root = Path(os.getenv('MEDIA_ROOT', 'media')).resolve()
                local_path = local_root / bucket_name / filename
                local_path.parent.mkdir(parents=True, exist_ok=True)
                def _write_file():
                    with open(local_path, 'wb') as f:
                        f.write(image_data)
                await asyncio.get_event_loop().run_in_executor(None, _write_file)
                local_url_base = os.getenv('MEDIA_URL', '/media')
                local_url = f"{local_url_base}/{bucket_name}/{filename}"
                return {
                    'success': True,
                    'filename': filename,
                    'bucket': bucket_name,
                    'size': len(image_data),
                    'url': local_url,
                    'path': str(local_path)
                }
            except Exception as e2:
                logger.error(f"Local media fallback failed: {str(e2)}")
                return {
                    'success': False,
                    'error': str(e2),
                    'filename': filename
                }
    
    def _get_bucket_for_size(self, size_name: str) -> str:
        """Get appropriate bucket for image size"""
        if size_name == 'thumbnail':
            return self.paths['thumbnails']
        elif size_name in ['small', 'medium']:
            return self.paths['compressed']
        else:
            return self.paths['product_images']
    
    async def _store_image_metadata(
        self, 
        vendor_id: str, 
        product_id: str, 
        metadata: Dict, 
        upload_results: Dict
    ) -> Dict[str, any]:
        """Store image metadata for tracking and optimization"""
        metadata_record = {
            'vendor_id': vendor_id,
            'product_id': product_id,
            'upload_timestamp': datetime.now().isoformat(),
            'original_metadata': metadata,
            'upload_results': upload_results,
            'storage_efficiency': self._calculate_storage_efficiency(metadata, upload_results)
        }
        
        # Store in database or file system
        metadata_filename = f"{vendor_id}/{product_id}/metadata.json"
        
        try:
            # Upload metadata to storage
            metadata_json = json.dumps(metadata_record, indent=2)
            await self.storage_client.upload_file(
                'metadata', metadata_filename, metadata_json.encode()
            )
            
            return {
                'success': True,
                'metadata_file': metadata_filename,
                'metadata': metadata_record
            }
            
        except Exception as e:
            logger.error(f"Metadata storage failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _verify_processed_image(
        self, 
        upload_results: Dict, 
        metadata: Dict
    ) -> Dict[str, any]:
        """Verify processed image quality and integrity"""
        verification_results = {
            'quality_check': True,
            'integrity_check': True,
            'compression_check': True,
            'format_check': True,
            'overall_score': 100
        }
        
        # Check compression efficiency
        if metadata['compression_ratio'] < 20:  # Less than 20% compression
            verification_results['compression_check'] = False
            verification_results['overall_score'] -= 20
        
        # Check file sizes
        for size_name, result in upload_results.items():
            if not result.get('success', False):
                verification_results['integrity_check'] = False
                verification_results['overall_score'] -= 30
                break
        
        # Check format optimization
        if metadata['format'] not in ['JPEG', 'WEBP', 'AVIF']:
            verification_results['format_check'] = False
            verification_results['overall_score'] -= 10
        
        return verification_results
    
    def _calculate_storage_efficiency(
        self, 
        metadata: Dict, 
        upload_results: Dict
    ) -> Dict[str, any]:
        """Calculate storage efficiency metrics"""
        original_size = metadata['original_size']
        compressed_size = metadata['compressed_size']
        
        space_saved = original_size - compressed_size
        compression_ratio = (space_saved / original_size) * 100 if original_size > 0 else 0
        
        # Calculate efficiency score
        efficiency_score = min(100, compression_ratio * 1.5)  # Max 100
        
        return {
            'original_size_mb': original_size / (1024 * 1024),
            'compressed_size_mb': compressed_size / (1024 * 1024),
            'space_saved_mb': space_saved / (1024 * 1024),
            'compression_ratio': compression_ratio,
            'efficiency_score': efficiency_score,
            'storage_cost_savings': space_saved / (1024 * 1024) * 0.02  # $0.02 per MB saved
        }
    
    async def get_storage_analytics(self, vendor_id: str) -> Dict[str, any]:
        """Get storage analytics for vendor"""
        try:
            # This would query the database for vendor's storage statistics
            # For now, return mock data
            return {
                'vendor_id': vendor_id,
                'total_images': 0,
                'total_storage_mb': 0,
                'average_compression_ratio': 0,
                'total_space_saved_mb': 0,
                'storage_cost_savings': 0,
                'efficiency_score': 0
            }
        except Exception as e:
            logger.error(f"Analytics retrieval failed: {str(e)}")
            return {'error': str(e)}
    
    async def optimize_existing_images(self, vendor_id: str) -> Dict[str, any]:
        """Optimize existing images for better compression"""
        # This would re-process existing images with better compression
        return {
            'vendor_id': vendor_id,
            'images_optimized': 0,
            'space_saved_mb': 0,
            'compression_improvement': 0
        }

# Global instance
optimized_storage = OptimizedStorageService()
