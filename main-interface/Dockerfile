# syntax=docker/dockerfile:1

FROM node:16 AS build
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json .
RUN npm install --production

COPY . .

FROM gcr.io/distroless/nodejs:16
ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app .

EXPOSE 8090

CMD [ "backend/server.js" ]