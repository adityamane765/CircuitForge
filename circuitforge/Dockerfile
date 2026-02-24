FROM node:20-slim

# Install system deps
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Scarb
RUN curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash -s -- -v 2.9.2

ENV PATH="/root/.local/bin:${PATH}"
ENV HOME="/root"

# Verify Scarb
RUN /root/.local/bin/scarb --version

# Pre-warm Scarb cache by compiling a dummy contract at build time
# so runtime never needs to download anything
WORKDIR /scarb-warmup
COPY warmup/Scarb.toml ./Scarb.toml
COPY warmup/src/lib.cairo ./src/lib.cairo
RUN HOME=/root /root/.local/bin/scarb build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build Next.js app
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]
