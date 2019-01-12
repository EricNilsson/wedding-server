FROM node:alpine

WORKDIR '/usr/src/app'

COPY package.json ./
COPY package-lock.json ./

RUN npm i

COPY . .

# Expose graphql
EXPOSE 4000

CMD [ "npm", "start" ]
