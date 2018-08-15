import 'reflect-metadata';

import * as TypeORM from 'typeorm';
import * as TypeGraphQL from 'type-graphql';

import { GraphQLServer, Options } from 'graphql-yoga';
import { Container } from 'typedi';

import { Invitee } from './entities/invitee';
import { Invitation } from './entities/invitation';
import { InvitationResolver } from './resolvers/invitation-resolver';


TypeGraphQL.useContainer(Container);
TypeORM.useContainer(Container);

async function bootstrap() {
    let schema;

    try {
        // Move config to file?
        await TypeORM.createConnection({
            type: 'postgres',
            database: 'wedding', // Move to env
            username: 'eric', // Move to env
            password: null, // Move to env
            port: 5432, // Move to env
            host: 'localhost', // Move to env
            entities: [Invitee, Invitation],
            synchronize: true,
            logger: 'advanced-console',
            logging: 'all',
            dropSchema: true,
            cache: true,
        });
    } catch(error) { console.log('error', error) }

    try {
        schema = await TypeGraphQL.buildSchema({
          resolvers: [InvitationResolver],
        });
    } catch (error) { console.log('error', error) }

     // Create GraphQL server
    const server = new GraphQLServer({ schema });

    // Configure server options
    const serverOptions: Options = {
      port: 4000,
      endpoint: "/graphql",
      playground: "/playground",
    };

    // Start the server
    server.start(serverOptions, ({ port, playground }) => {
      console.log(
        `Server is running, GraphQL Playground available at http://localhost:${port}${playground}`,
      );
    });
}

try {
    bootstrap();
} catch (error) { console.log('error', error) }
