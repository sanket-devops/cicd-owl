### STAGE 1: Build ###
FROM node:18.14.0-alpine

COPY . /app/
# COPY package*.json /app/

# Start build backend
WORKDIR /app/cicd-owl-be

# Install app dependencies
RUN npm set progress=false && npm cache clear --force && npm install

# Start build backend
WORKDIR /app/cicd-owl-fe

# # Install app dependencies
RUN npm set progress=false && npm cache clear --force && npm install

# Exposing port
EXPOSE 8888 3000

# Start app
ENTRYPOINT cd /app && sh start.sh


# docker rm -f cicd && docker run --name cicd -p 8888:8888 -p 3000:3000 cicd
