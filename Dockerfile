FROM node:alpine

# the server
COPY ./deployment/server /app
COPY ./assets /app/public/assets
COPY ./index.html /app/public/

# copy files for building the phaser game
COPY ./package.json /starry-skies/
COPY ./package-lock.json /starry-skies/
COPY ./tsconfig.json /starry-skies/
COPY ./webpack.config.js /starry-skies/
COPY ./src /starry-skies/src

# build the phaser game and expose publicly
WORKDIR /starry-skies
RUN npm install 
RUN npm run build
RUN mv build ../app/public/build
RUN rm -r /starry-skies

# install and run the server
WORKDIR /app
RUN npm install
CMD ["npm","run", "start"]
