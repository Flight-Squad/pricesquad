FROM node:latest
LABEL maintainer="pmehrotra2@babson.edu"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies

ADD package.json yarn.lock ./
# Run yarn without generating a yarn.lock file
RUN yarn --pure-lockfile

# Bundle app source
ADD . .

# EXPOSE doesn't actually expose the port, and it could confuse some cloud providers
# EXPOSE 3000

CMD [ "yarn", "run", "docker" ]
