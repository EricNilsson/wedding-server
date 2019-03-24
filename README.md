# Tool for managing invitations and allowing invitees to set their RSVP status

Steps to run this project:

1. Run `yarn`
2. Run `yarn start`


Steps for DEV:

1. Create `.env` file in root folder. Base it on `.env-base`.
1. Run `yarn dev` to compile, start and watch for changes.

* GraphQL playground will be available on `/playground` and the graphQL api is exposed on `/graphql`. Both on port 4000.


Steps for running in docker:

1. Create `.env-docker` file in root folder. Base it on `.env-base`.
2. Run `docker-compose up --build`. Use the `-d` flag to run in detached mode.
