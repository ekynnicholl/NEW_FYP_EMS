FROM node:18-alpine as base
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

# docker pull ghcr.io/puppeteer/puppeteer:latest # pulls the latest 
# docker pull ghcr.io/puppeteer/puppeteer:16.1.0 # pulls the image that contains Puppeteer v16.1.0

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Puppeteer v19.8.0
RUN yarn add puppeteer@19.8.0

# Update npm to the latest version
RUN npm install npm@latest -g

WORKDIR /app
COPY package*.json ./
EXPOSE 3000
# RUN npm install puppeteer \
#     npm install puppeteer-core \
#     npm install chromium \
#     npx puppeteer browsers install chrome
# Install Puppeteer and the specific version of Chromium
RUN npm install 
# && npx puppeteer install --revision=112.0.5614.0

FROM base as builder
WORKDIR /app
COPY . .
RUN echo "Building the application" && npm run build

FROM base as production
WORKDIR /app

ENV NODE_ENV=production
RUN npm ci

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

CMD npm start

FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD npm run dev