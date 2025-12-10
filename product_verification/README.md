# Product Verification API

A FastAPI application that uses OpenAI's CLIP model to verify if product images match their titles/descriptions with a probability threshold of 0.7.

## Features

- **Single Product Verification**: Upload an image and provide a title to check if they match
- **Batch Verification**: Compare an image against multiple titles to find the best match
- **Probability Scoring**: Get detailed probability scores for image-text similarity
- **GPU Support**: Automatically uses CUDA if available, falls back to CPU

## Installation

1. Make sure you're in the productVerification directory:
```bash
cd C:\Users\ravig\Desktop\Projects\AveoEarthEcomm\productVerification
```

2. Install dependencies (already done if you followed the setup):
```bash
uv sync
```

## Running the API

Start the FastAPI server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc

## Endpoints

### 1. Health Check
```
GET /
```
Returns API status and device information.

### 2. Single Product Verification
```
POST /verify-product
```
**Parameters:**
- `file`: Image file (multipart/form-data)
- `title`: Product title/description (form field)

**Response:**
```json
{
  "filename": "product.jpg",
  "title": "women offshoulder white top",
  "probability": 0.8542,
  "is_match": true,
  "threshold": 0.7,
  "device_used": "cuda"
}
```

### 3. Batch Product Verification
```
POST /verify-product-batch
```
**Parameters:**
- `file`: Image file (multipart/form-data)
- `titles`: Comma-separated list of titles to compare against

**Response:**
```json
{
  "filename": "product.jpg",
  "results": [
    {
      "title": "boy",
      "probability": 0.1234,
      "is_match": false
    },
    {
      "title": "women offshoulder white top",
      "probability": 0.8542,
      "is_match": true
    }
  ],
  "best_match": {
    "title": "women offshoulder white top",
    "probability": 0.8542,
    "is_match": true
  },
  "any_match_above_threshold": true,
  "threshold": 0.7,
  "device_used": "cuda"
}
```

## Testing

Run the test script to verify the API works:
```bash
python test_api.py
```

Make sure the API is running before executing the test script.

## Example Usage with curl

### Single verification:
```bash
curl -X POST "http://localhost:8000/verify-product" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@category1.png" \
  -F "title=women offshoulder white top"
```

### Batch verification:
```bash
curl -X POST "http://localhost:8000/verify-product-batch" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@category1.png" \
  -F "titles=boy,fashion,top,women offshoulder white top"
```

## How it Works

1. **Image Processing**: Uploaded images are preprocessed using CLIP's image preprocessing pipeline
2. **Text Encoding**: Product titles are tokenized and encoded using CLIP's text encoder
3. **Similarity Calculation**: The cosine similarity between image and text embeddings is calculated
4. **Probability Score**: The similarity is converted to a probability using softmax
5. **Threshold Check**: Results with probability > 0.7 are considered matches

## Performance Notes

- **GPU Usage**: The API automatically detects and uses CUDA if available for faster inference
- **Model Loading**: The CLIP model is loaded once at startup and reused for all requests
- **Image Formats**: Supports common image formats (PNG, JPG, JPEG, etc.)
- **Memory**: Each request processes one image at a time to manage memory usage

## Error Handling

The API includes comprehensive error handling for:
- Invalid image formats
- Corrupted image files
- Missing parameters
- Model inference errors
- Server-side exceptions

All errors return appropriate HTTP status codes with descriptive error messages.
