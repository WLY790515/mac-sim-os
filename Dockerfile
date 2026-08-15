FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/src ./src
COPY client/public ./public
COPY client/index.html ./
COPY client/tsconfig.json ./
COPY client/tsconfig.node.json ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE $PORT
CMD ["serve", "dist", "-p", "$PORT", "-s"]
