# Use a minimal Node.js 20 image for building
FROM node:22-alpine AS builder

# Install Python and build dependencies for node-gyp
# RUN apk add --no-cache python3 make g++ bash
RUN apk add --no-cache python3 make g++ bash \
    cairo-dev pango-dev jpeg-dev giflib-dev pixman-dev


# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

RUN npm rebuild bcrypt --build-from-source

# Install dependencies without dev dependencies
RUN yarn install --frozen-lockfile --production

# RUN yarn rebuild bcrypt --build-from-source
# Copy the rest of the application
COPY . .

RUN yarn build;

# Use a lightweight runtime image
FROM gcr.io/distroless/nodejs22 AS runner

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["./server.js"]


# // "postinstall": "npx tailwindcss -i ./src/styles/globals.css -o ./public/tailwind.css"
