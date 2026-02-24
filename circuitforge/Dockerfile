# Stage 1: Build
FROM node:20-slim AS builder

# Install system deps for Scarb installation
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Scarb (Cairo package manager / compiler)
RUN curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash -s -- -v 2.9.2

# Add Scarb to PATH
ENV PATH="/root/.local/share/scarb/bin:${PATH}"

# Verify Scarb is available
RUN scarb --version

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Build Next.js app
RUN npm run build

# Stage 2: Production runtime
FROM node:20-slim AS runner

# Install runtime deps for Scarb
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Scarb in runtime image too
RUN curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash -s -- -v 2.9.2

ENV PATH="/root/.local/share/scarb/bin:${PATH}"
ENV NODE_ENV=production

WORKDIR /app

# Copy built output from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]