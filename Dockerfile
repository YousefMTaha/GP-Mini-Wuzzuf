FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm i yarn

RUN yarn 

COPY . .

EXPOSE 3000

# Environment variables
ENV PORT=3000

# DB
ENV DB_URL="mongodb+srv://tyousef262:pFRnRyJt4BhXXsRA@cluster0.cwz5mhe.mongodb.net/GP-Mini-wuzzuf"

# crypto
ENV CRYPTO_KEY="5rXNeCUe7YMOaUxLim5J9nR3qs535enGhGHYEBC"

# jwt
ENV SECRET_JWT="awjksfbgjdasfbgijdsfg"

# send email
ENV EMAIL="tyousef262@gmail.com"
ENV PASS="pngu mkjw kafq ylxf"

# google client
ENV CLIENT_ID="719040349879-f08j2s7i6d9rjk2jddkrobdb42d5odo4.apps.googleusercontent.com"

# config cloudinary
ENV CLOUD_NAME="ducoqbn7x"
ENV API_KEY="318884386692974"
ENV API_SECRET="FO3iRWv8RWzwabFZ95mdRWBtETA"


CMD ["yarn", "start"]