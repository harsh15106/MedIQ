# Use Python 3.9 slim as base
FROM python:3.9-slim

# Install system dependencies for OCR and PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the service port
EXPOSE 8005

# Start the service
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8005"]
