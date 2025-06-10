# Step 1: Build the Next.js application
FROM node:16 AS builder

# Set the working directory to /app
WORKDIR /app

# Copy package.json, package-lock.json, and .env.local to the container
COPY package.json package-lock.json .env.local ./

# Install dependencies
RUN npm install

COPY . .
# Copy the src directory and other project files into the container
COPY src ./src
COPY next.config.js ./

# Build the Next.js application
RUN npm run build

# Step 2: Run the app in a production environment
FROM node:16-slim

# Set the working directory to /app
WORKDIR /app

# Copy built application files from the builder stage
COPY --from=builder /app ./

# Install only production dependencies
RUN npm install --production

# Copy .env.local file for runtime as well (since this is needed at runtime)
COPY .env.local .env.local

# Expose the default Next.js port
EXPOSE 3000

# Run the app in production mode
CMD ["npm", "start"]
