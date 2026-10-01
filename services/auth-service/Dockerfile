FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]