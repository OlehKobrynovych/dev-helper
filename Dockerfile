FROM node:18-alpine

WORKDIR /app-frontend

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

EXPOSE 3000

ENV PORT=3000

CMD ["yarn", "start"]
