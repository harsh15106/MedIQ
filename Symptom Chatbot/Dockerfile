# Use Python 3.9 slim as base
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the service port
EXPOSE 8000

# Start the service
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
