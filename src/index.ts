import 'reflect-metadata';

import * as TypeORM from 'typeorm';
import * as TypeGraphQL from 'type-graphql';
import * as jwt from 'express-jwt';

import { GraphQLServer, Options } from 'graphql-yoga';
import { Container } from 'typedi';
import { Context } from './common/context.interface';
import { authChecker } from './auth-checker';

import { Invitee } from './entities/invitee';
import { Invitation } from './entities/invitation';

import { InviteeResolver } from './resolvers/invitee-resolver';
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
            entities: [
                Invitee,
                Invitation
            ],
            synchronize: true,
            logger: 'advanced-console',
            logging: 'all',
            dropSchema: true,
            cache: true,
        });
    } catch(error) { console.log('error', error) }

    try {
        schema = await TypeGraphQL.buildSchema({
            resolvers: [
                InvitationResolver,
                InviteeResolver
            ],
            authChecker
        });
    } catch (error) { console.log('error', error) }

    // Create GraphQL server
    const server = new GraphQLServer({
        schema,
        context: ({ request }) => {
            console.log('request', request);
            const context: Context = {
                invitation: (request as any).invitation,
            };
            return context;
        }
    });

    // Configure server options
    const serverOptions: Options = {
        port: 4000,
        endpoint: '/graphql',
        playground: '/playground',
    };

    // Start the server
    server.start(serverOptions, ({ port, playground }) => {
        console.log(
            `Server is running, GraphQL Playground available at http://localhost:${port}${playground}`,
        );
    });
    server.express.use(
        serverOptions.endpoint,
        jwt({
            secret: process.env.JWT_SECRET || 'TODO: FIX SECRET',
            credentialsRequired: false,
            userProperty: 'invitation'
        })
    );
}

try {
    bootstrap();
} catch (error) { console.log('error', error) }
