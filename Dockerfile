# Stage 1: Base
FROM node:18-alpine as base

# Install dependencies
RUN apk add --no-cache \
    g++ \
    make \
    py3-pip \
    libc6-compat \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    glib \
    nspr \
    dbus-libs \
    at-spi2-core \
    cups-libs \
    libdrm \
    libxcb \
    libxkbcommon \
    libx11 \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    libxrandr \
    pango \
    cairo \
    alsa-lib 

# Tell Puppeteer to skip installing Chrome. We'll use the one from Alpine.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Puppeteer v19.8.0
RUN yarn add puppeteer@19.8.0

WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# Install node modules using yarn for consistency
RUN yarn install

# Stage 2: Build Stage
FROM base as builder
WORKDIR /app
COPY . .
RUN yarn run build

# Stage 3: Production Stage
FROM base as production
WORKDIR /app

ENV NODE_ENV=production
RUN yarn install --production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

CMD ["yarn", "start"]

# Stage 4: Development Stage
FROM base as dev
ENV NODE_ENV=development
RUN yarn install
COPY . .
CMD ["yarn", "dev"]