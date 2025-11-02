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

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Run migrations and start
CMD npx prisma migrate deploy && npm start
