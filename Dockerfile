FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client
COPY client/ ./client/
RUN npm run build --prefix client

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/client/dist ./dist
EXPOSE $PORT
CMD ["serve", "dist", "-p", "$PORT", "-s"]
