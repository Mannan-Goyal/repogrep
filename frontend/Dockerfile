FROM node:16 AS Backend

ENV NODE_ENV=production

WORKDIR /usr/src/client

COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm i -g serve

COPY . .
RUN npm run build

CMD ["sh", "-c", "serve -s build -l 3000"]