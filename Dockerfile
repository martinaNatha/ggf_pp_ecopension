FROM node:18
 
# Install unixODBC, Oracle Instant Client, and ODBC driver
RUN apt-get update && \
    apt-get install -y unixodbc unixodbc-dev odbcinst libodbc1
 
WORKDIR /usr/scr/app/
COPY package*.json ./
RUN npm install
 
COPY . .
 
EXPOSE 8086
 
CMD [ "npm", "start" ]