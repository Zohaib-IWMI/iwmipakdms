FROM node:20-alpine

WORKDIR /backend
COPY package.json .
RUN npm install
RUN rm -rf /var/lib/apt/lists/*
COPY . .
CMD npm start

EXPOSE 8081