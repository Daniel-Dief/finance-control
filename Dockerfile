# syntax=docker/dockerfile:1

# Build stage
# The bundle output is platform-independent, so the build runs on the native
# build platform (avoids slow QEMU emulation when cross-building for arm64).
FROM --platform=$BUILDPLATFORM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock .npmrc* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
# nginx:alpine is multi-arch, so it resolves to the target platform automatically
# (linux/amd64, linux/arm64, ...).
FROM nginx:alpine AS runner

# Update packages to fix vulnerabilities
RUN apk update && apk upgrade --no-cache

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
