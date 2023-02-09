FROM node AS Production

ENV NODE_ENV=production

WORKDIR /usr/merck/src/client

COPY package.json .
COPY vite.config.ts .

# Wont have package-lock.json untill npm install
# COPY package-lock.json .

RUN npm install --legacy-peer-deps

COPY . .

# Causes errors. vite is not recognized as a command??
# Currently we copy over the dist folder from the host machine
# which was generating by run vite build on the host machine.
# Ideally we want this container to run vite build
# RUN npm run build
RUN npm install -g serve

# CMD ["sh", "-c", "npm run start"]
CMD ["sh", "-c", "serve -s dist"]