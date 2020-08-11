# Use an official ubuntu runtime as a parent image
FROM node:14.7.0-alpine3.12

# Set the working directory to /app
WORKDIR /app
# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages
RUN npm install

# Add the environment variables
ENV ARANGODB_HOST=localhost
ENV ARANGODB_PORT=8529
ENV ARANGODB_USERNAME=root
ENV ARANGODB_PASSWORD=openSesame
ENV ARANGODB_DB_NAME=persons

ENV ARANGO_MAX_RETRY_ATTEMPTS=3
ENV ARANGO_RETRY_DELAY=250

ENV JWT_SECRET=mydirtylittlesecret
ENV JWT_ACCESS_TOKEN_VALIDITY=3600
ENV JWT_REFRESH_TOKEN_VALIDITY=86400

# Specify the run command
CMD ["node", "/app/app.js"]