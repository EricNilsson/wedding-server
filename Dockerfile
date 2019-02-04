FROM node:alpine

WORKDIR '/usr/src/app'

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

# Expose graphql
EXPOSE 4000

CMD [ "yarn", "prod" ]
