# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for Prisma)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Remove dev dependencies
RUN npm prune --production

# Create data directory for database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Use start script
CMD ["./start.sh"]
