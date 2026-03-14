# Use Node 18 slim as base
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
