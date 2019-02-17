FROM node:11.1-alpine

COPY . .
RUN yarn install
CMD ["yarn", "start"]
EXPOSE 8080
