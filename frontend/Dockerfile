# Use Nginx image for serving static files
FROM nginx:latest

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy static files into the container
COPY . .

# Expose port 80
EXPOSE 80