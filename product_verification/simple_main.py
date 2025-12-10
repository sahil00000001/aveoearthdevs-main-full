from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Optional
import base64
from PIL import Image
import io

app = FastAPI(
    title="Product Verification API",
    description="API to verify if product images match their titles (Simplified version)",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Product Verification API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "product-verification"}

@app.post("/verify")
async def verify_product(
    image: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None)
):
    """
    Verify if a product image matches its title.
    This is a simplified version that returns mock data.
    """
    try:
        # Read and validate image
        image_data = await image.read()
        
        # Basic image validation
        try:
            img = Image.open(io.BytesIO(image_data))
            width, height = img.size
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        
        # Mock verification logic (replace with actual CLIP model when available)
        verification_score = 0.85  # Mock score
        is_verified = verification_score > 0.7
        
        # Mock analysis
        analysis = {
            "image_analysis": {
                "width": width,
                "height": height,
                "format": img.format,
                "mode": img.mode
            },
            "text_analysis": {
                "title": title,
                "description": description,
                "word_count": len(title.split()) if title else 0
            },
            "verification": {
                "score": verification_score,
                "is_verified": is_verified,
                "confidence": "high" if verification_score > 0.8 else "medium" if verification_score > 0.6 else "low"
            }
        }
        
        return JSONResponse(content={
            "success": True,
            "verification_score": verification_score,
            "is_verified": is_verified,
            "analysis": analysis,
            "message": "Product verification completed (simplified version)"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
