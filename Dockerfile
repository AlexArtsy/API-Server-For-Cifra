FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && \
    mkdir -p /app/uploads && \
    mkdir -p /app/public

COPY . .

EXPOSE 3000

CMD ["npm", "start"]