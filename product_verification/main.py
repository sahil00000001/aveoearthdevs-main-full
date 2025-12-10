import torch
import clip
from PIL import Image
import io
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Optional


app = FastAPI(
    title="Product Verification API",
    description="API to verify if product images match their titles using CLIP model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

@app.get("/")
async def root():
    return {"message": "Product Verification API", "status": "running", "device": device}

@app.post("/verify-product")
async def verify_product(
    file: UploadFile = File(..., description="Product image file"),
    title: str = Form(..., description="Product title/description")
):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image_input = preprocess(image).unsqueeze(0).to(device)
        
        text_input = clip.tokenize([title, "random unrelated object"]).to(device)
        
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            text_features = model.encode_text(text_input)
            
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            temperature = 100.0
            logits = temperature * image_features @ text_features.T
            probs = logits.softmax(dim=-1).cpu().numpy()
            
            probability = float(probs[0][0])
            negative_probability = float(probs[0][1])
        
        is_match = probability > 0.7
        
        return {
            "filename": file.filename,
            "title": title,
            "probability": round(probability, 4),
            "negative_probability": round(negative_probability, 4),
            "is_match": is_match,
            "threshold": 0.7,
            "device_used": device
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/verify-product-batch")
async def verify_product_batch(
    file: UploadFile = File(..., description="Product image file"),
    titles: str = Form(..., description="Comma-separated product titles to compare against")
):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        title_list = [title.strip() for title in titles.split(',') if title.strip()]
        if not title_list:
            raise HTTPException(status_code=400, detail="At least one title must be provided")
        
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image_input = preprocess(image).unsqueeze(0).to(device)
        
        text_inputs = clip.tokenize(title_list).to(device)
        
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            text_features = model.encode_text(text_inputs)
            
            logits_per_image, logits_per_text = model(image_input, text_inputs)
            probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
        
        results = []
        for i, title in enumerate(title_list):
            prob = float(probs[i])
            results.append({
                "title": title,
                "probability": round(prob, 4),
                "is_match": prob > 0.7
            })
        
        best_match_idx = np.argmax(probs)
        best_match = results[best_match_idx]
        
        any_match = any(result["is_match"] for result in results)
        
        return {
            "filename": file.filename,
            "results": results,
            "best_match": best_match,
            "any_match_above_threshold": any_match,
            "threshold": 0.7,
            "device_used": device
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8001) 