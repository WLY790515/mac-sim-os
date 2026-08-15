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
RUN PATH="/app/client/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" npm run build

FROM caddy:2-alpine
COPY --from=builder /app/client/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 8080
