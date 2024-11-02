# Use Node.js 20 as the base image to run the Express server
FROM node:20-alpine

# Install Nginx
RUN apk update && apk add nginx

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all files to the container (including the public directory and configuration files)
COPY . .

# Copy the Nginx configuration file to configure static file serving and proxying
COPY nginx.conf /etc/nginx/nginx.conf

# Expose both ports (80 for Nginx, 3000 for Express)
EXPOSE 80 3000

# Start Nginx and the Express server
CMD ["sh", "-c", "nginx && node server.js"]
