FROM node:23-alpine

# Install necessary packages
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

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Puppeteer v19.8.0
RUN yarn add puppeteer@19.8.0

# # Update npm to the latest version
# RUN npm install npm@latest -g

# # Initialize a new Node.js project
# RUN npm init -y

WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# # Change ownership of the application files
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nextjs -u 1001 && \
#     chown -R nextjs:nodejs /app

# USER nextjs

# Start the application
CMD npm start