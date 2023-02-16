### STAGE 1: Build ###
FROM node:16.15.1-alpine

# RUN apt update && apt install wget -y && npm install --location=global fast-cli
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN apt install ./google-chrome-stable_current_amd64.deb -y

WORKDIR /app

COPY package*.json /app/

# Install app dependencies
RUN cd /app && npm set progress=false && npm cache clear --force && npm install

COPY . .

# Exposing port
EXPOSE 8888

#CMD ["npm", "run", "start"]
ENTRYPOINT npm run start
