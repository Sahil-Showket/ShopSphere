FROM node:22-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3003

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]