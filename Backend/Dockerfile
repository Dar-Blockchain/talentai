# Step 1: Use official Node.js image for building the backend
FROM node:18 AS builder

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code (including .env file)
COPY . .

# Step 2: Run the app in a production environment
FROM node:18-slim 
 # Use a slim Node.js image for production

# Set the working directory to /app
WORKDIR /app

# Copy the installed dependencies and source code from the builder stage
COPY --from=builder /app ./

# Install only production dependencies (for smaller image size)
RUN npm install --production

# Copy the .env file for runtime use
COPY .env .env

# Expose the port your Express app will run on
EXPOSE 5000

# Run the app in production mode
CMD ["npm", "start"]
