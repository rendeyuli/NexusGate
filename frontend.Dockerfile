FROM oven/bun:1 as builder
WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/cache \
    BUN_INSTALL_CACHE_DIR=/cache bun install --frozen-lockfile
RUN cd frontend && NODE_ENV=production bun run build 

FROM nginx:alpine
COPY ./nginx-entrypoint.sh /nginx-entrypoint.sh
COPY --from=builder /app/frontend/dist/ /var/www/html/
LABEL org.opencontainers.image.source="https://github.com/GeekChange/NexusGate"
LABEL org.opencontainers.image.licenses="Apache-2.0"
EXPOSE 80/tcp