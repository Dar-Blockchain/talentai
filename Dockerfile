# Step 1: Build the Next.js application
FROM node:20 AS builder

# Set the working directory to /app
WORKDIR /app

# Define build arguments for all environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG OPENAI_API_KEY
ARG LINKEDIN_CLIENT_ID
ARG LINKEDIN_CLIENT_SECRET
ARG LINKEDIN_REDIRECT_URI
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG ASSEMBLYAI_API_KEY
ARG NODE_ENV=production

# Set environment variables from build arguments
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV LINKEDIN_CLIENT_ID=$LINKEDIN_CLIENT_ID
ENV LINKEDIN_CLIENT_SECRET=$LINKEDIN_CLIENT_SECRET
ENV LINKEDIN_REDIRECT_URI=$LINKEDIN_REDIRECT_URI
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV ASSEMBLYAI_API_KEY=$ASSEMBLYAI_API_KEY
ENV NODE_ENV=$NODE_ENV

# Copy package.json, package-lock.json, next.config.js to the container
COPY package.json package-lock.json next.config.ts tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the Next.js application
RUN npm run build

# Step 2: Run the app in production environment
FROM node:20-slim

# Set the working directory to /app
WORKDIR /app

# Define runtime arguments
ARG NEXT_PUBLIC_API_BASE_URL
ARG OPENAI_API_KEY
ARG LINKEDIN_CLIENT_ID
ARG LINKEDIN_CLIENT_SECRET
ARG LINKEDIN_REDIRECT_URI
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG ASSEMBLYAI_API_KEY
ARG NODE_ENV=production

# Set runtime environment variables
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV LINKEDIN_CLIENT_ID=$LINKEDIN_CLIENT_ID
ENV LINKEDIN_CLIENT_SECRET=$LINKEDIN_CLIENT_SECRET
ENV LINKEDIN_REDIRECT_URI=$LINKEDIN_REDIRECT_URI
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV ASSEMBLYAI_API_KEY=$ASSEMBLYAI_API_KEY
ENV NODE_ENV=$NODE_ENV

# Copy package files first
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --force


# Copy built files and public directory
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Verify public directory exists and list contents for debugging
RUN ls -la && echo "Checking public directory:" && ls -la public

# Expose the default Next.js port
EXPOSE 3000

# Run the app in production mode
CMD ["npm", "start"]
