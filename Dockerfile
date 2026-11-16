# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime Production Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3006

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend and application source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Ensure data and uploads directories exist
RUN mkdir -p /app/data /app/uploads

EXPOSE 3006

CMD ["npm", "run", "server"]
