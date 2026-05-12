# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for tsc)
RUN npm install

# Copy source code and scripts
COPY . .

# Build the project (compiles TS to JS and copies migrations)
RUN npm run build:clean

# Stage 2: Runtime
FROM node:22-slim

WORKDIR /app

# Install runtime dependencies for sharp and better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled code and migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Create directory for SQLite database if it doesn't exist
RUN mkdir -p data

# The command to run the sharded bot
CMD ["npm", "run", "start:shard"]
