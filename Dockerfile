FROM node:alpine
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm i
COPY . /app
RUN mkdir images
EXPOSE 3002
CMD ["node", "server.js"]
