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

# Add Scarb to PATH (install script puts it at /root/.local/bin/scarb)
ENV PATH="/root/.local/bin:${PATH}"

# Verify Scarb is available
RUN /root/.local/bin/scarb --version

# Pre-warm Scarb registry cache by compiling a dummy starknet contract.
# This bakes the downloaded crates into the image so runtime compilations
# don't re-download and blow past the 512MB RAM limit.
RUN mkdir -p /scarb-warmup/src && \
    printf '[package]\nname = "warmup"\nversion = "0.1.0"\nedition = "2024_07"\n\n[dependencies]\nstarknet = "2.9.2"\n\n[[target.starknet-contract]]\nsierra = true\ncasm = true\n' > /scarb-warmup/Scarb.toml && \
    printf '#[starknet::contract]\nmod warmup {\n    #[storage]\n    struct Storage {}\n}\n' > /scarb-warmup/src/lib.cairo && \
    /root/.local/bin/scarb build --manifest-path /scarb-warmup/Scarb.toml && \
    rm -rf /scarb-warmup

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

ENV PATH="/root/.local/bin:${PATH}"
ENV NODE_ENV=production

WORKDIR /app

# Copy Scarb binary + pre-warmed registry cache from builder
COPY --from=builder /root/.local/bin/scarb /root/.local/bin/scarb
COPY --from=builder /root/.local/share/scarb /root/.local/share/scarb
COPY --from=builder /root/.local/share/scarb-install /root/.local/share/scarb-install

# Copy built output from builder
COPY --from=builder /app/.next/standalone ./
RUN mkdir -p ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]