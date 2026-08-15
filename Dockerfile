FROM node:22-alpine AS builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/src ./src
COPY client/public ./public
COPY client/index.html ./
COPY client/tsconfig.json ./
COPY client/tsconfig.node.json ./
COPY client/vite.config.ts ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/client/dist ./dist
EXPOSE $PORT
CMD ["serve", "dist", "-p", "$PORT", "-s"]
