# Stage 1: Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (optional native modules will fallback automatically)
RUN npm install

# Stage 2: Copy app source
FROM node:20-alpine AS dev

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the frontend source code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Default command to run the dev server and bind to all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
