FROM node:18
WORKDIR /usr/scr/app/
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8086

CMD [ "npm", "start" ]