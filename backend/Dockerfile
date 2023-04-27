FROM node:16 AS Backend

WORKDIR /usr/src/api

COPY package.json .
COPY pnpm-lock.yaml .

RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN npm run build

CMD ["sh", "-c", "npm run start:prod"]