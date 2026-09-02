# =========================================
# STAGE 1: Build & Install Dependencies
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# =========================================
# STAGE 2: Production Image
# =========================================
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production && npm cache clean --force

COPY --from=builder /app/src ./src

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
