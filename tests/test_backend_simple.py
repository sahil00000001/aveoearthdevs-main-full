from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create a simple FastAPI app for testing
app = FastAPI(title="AveoEarth Test API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AveoEarth Test API is running!"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "AveoEarth Test API",
        "version": "1.0.0"
    }

@app.get("/products")
async def get_products():
    return {
        "products": [
            {
                "id": "1",
                "name": "Test Product 1",
                "price": 29.99,
                "description": "This is a test product"
            },
            {
                "id": "2", 
                "name": "Test Product 2",
                "price": 39.99,
                "description": "This is another test product"
            }
        ]
    }

@app.get("/supplier/products")
async def get_supplier_products():
    return {
        "products": [
            {
                "id": "1",
                "name": "Supplier Product 1",
                "price": 19.99,
                "description": "This is a supplier product"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
