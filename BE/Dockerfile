# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Copy Prisma schema separately to leverage Docker cache for Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Build TypeScript code
COPY . .
RUN npm run build

# Prune devDependencies to keep image small
RUN npm prune --omit=dev

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy strictly required production layers
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/server.js"]
