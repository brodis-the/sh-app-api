FROM node:12.13.0-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3333

CMD ["npm", "start"]
