FROM node:20-slim

# Install system dependencies for native modules (sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Ensure the data directory exists
RUN mkdir -p data

EXPOSE 3001

# Run database initialization and then start
CMD ["sh", "-c", "npm run db:init && npm run start:prod"]
