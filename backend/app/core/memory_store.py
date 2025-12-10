"""
In-memory product store for DEBUG mode when database is unavailable
Stores products temporarily so they appear in listings
"""

from typing import Dict, List, Optional
from datetime import datetime
import threading

class MemoryProductStore:
    """Thread-safe in-memory store for products in DEBUG mode"""
    
    def __init__(self):
        self._products: Dict[str, Dict] = {}
        self._lock = threading.Lock()
    
    def add_product(self, product_data: Dict) -> str:
        """Add a product to the store"""
        with self._lock:
            product_id = product_data.get('id', f"mem-{datetime.utcnow().timestamp()}")
            self._products[product_id] = {
                **product_data,
                'id': product_id,
                'created_at': product_data.get('created_at', datetime.utcnow()),
            }
            return product_id
    
    def get_all_products(self, status: Optional[str] = None, visibility: Optional[str] = None) -> List[Dict]:
        """Get all products, optionally filtered"""
        with self._lock:
            products = list(self._products.values())
            if status:
                products = [p for p in products if p.get('status') == status]
            if visibility:
                products = [p for p in products if p.get('visibility') == visibility]
            return products
    
    def get_product(self, product_id: str) -> Optional[Dict]:
        """Get a specific product by ID"""
        with self._lock:
            return self._products.get(product_id)
    
    def clear(self):
        """Clear all products (for testing)"""
        with self._lock:
            self._products.clear()

# Global instance
memory_store = MemoryProductStore()







