#Stage 1
FROM node:20-alpine as build-stage

# RUN apt-get update && apt-get upgrade

WORKDIR /frontend
COPY package.json ./
#RUN npm install
# RUN --mount=type=cache,target=/root/.npm npm install
# COPY ./.npmrc ~/.npmrc
RUN npm install
COPY . .
RUN npm run build

# Stage 2

FROM nginx:1.17.0-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build-stage /frontend/build /usr/share/nginx/html
EXPOSE $REACT_DOCKER_PORT
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./proxy_params /etc/nginx/