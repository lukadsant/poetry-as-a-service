# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (produces the /dist folder)
RUN npm run build

# Stage 2: Serve the app using NGINX
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Railway will assign PORT, NGINX by default listens on 80.
# If Railway requires the specific PORT env var, we replace the default conf in entrypoint or Railway handles it.)
# Railway maps PORT to 80 natively if you expose 80.
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
