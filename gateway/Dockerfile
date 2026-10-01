FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]