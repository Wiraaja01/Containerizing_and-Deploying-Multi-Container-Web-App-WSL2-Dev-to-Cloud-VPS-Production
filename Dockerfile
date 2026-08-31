# =========================================
# STAGE 1: Build & Install Dependencies
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest dependency dulu untuk memanfaatkan Docker Layer Caching
COPY package*.json ./

# Install seluruh dependency (termasuk devDependencies jika ada)
RUN npm ci

# Copy source code aplikasi
COPY . .

# =========================================
# STAGE 2: Production Image
# =========================================
FROM node:20-alpine AS production

# Set environment ke production
ENV NODE_ENV=production

WORKDIR /app

# Copy hanya package.json dan install production dependency saja
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code dari stage builder
COPY --from=builder /app/src ./src

# Best Practice Keamanan: Jalankan aplikasi sebagai non-root user bawaan Alpine ('node')
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
