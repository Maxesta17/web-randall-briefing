# Briefing form — single service: Node (server) + Python (markitdown converter).
# Debian slim (not Alpine) so pip wheels for markitdown's deps install cleanly.
FROM node:20-slim

WORKDIR /app

# System deps: Python + pip for markitdown, and libs it uses for PDF/office/images.
# ffmpeg/libmagic help markitdown sniff and handle a wider range of file types.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-venv \
      libmagic1 \
      wget \
    && rm -rf /var/lib/apt/lists/*

# Install markitdown into an isolated venv (Debian blocks global pip by default).
# Put the venv on PATH so the `markitdown` CLI is available to the Node server.
ENV VENV=/opt/venv
RUN python3 -m venv "$VENV" \
    && "$VENV/bin/pip" install --no-cache-dir --upgrade pip \
    && "$VENV/bin/pip" install --no-cache-dir "markitdown[all]"
ENV PATH="$VENV/bin:$PATH"

# Node deps first for better layer caching.
COPY package.json ./
RUN npm install --omit=dev

# App source.
COPY server.js ./
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
