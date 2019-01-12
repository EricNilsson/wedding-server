import 'reflect-metadata';
import './env.ts';

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
import { AuthResolver } from './resolvers/auth-resolver';

TypeGraphQL.useContainer(Container);
TypeORM.useContainer(Container);

async function bootstrap() {
    let schema;

    try {
        // Move config to file?
        await TypeORM.createConnection({
            type: 'postgres',
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: parseInt(process.env.DB_PORT),
            host: process.env.DB_HOST,
            entities: [
                Invitee,
                Invitation
            ],
            synchronize: true,
            logger: 'advanced-console',
            logging: true,
            dropSchema: false,
            cache: true,
        });
    } catch(error) { console.log('error', error) }

    try {
        schema = await TypeGraphQL.buildSchema({
            resolvers: [
                InvitationResolver,
                InviteeResolver,
                AuthResolver
            ],
            authChecker
        });
    } catch (error) { console.log('error', error) }

    // Create GraphQL server
    const server = new GraphQLServer({
        schema,
        context: ({ request }) => {
            const context: Context = {
                tokenData: (request as any).tokenData
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

    server.express.use(
        serverOptions.endpoint,
        jwt({
            secret: process.env.JWT_SECRET,
            credentialsRequired: false,
            userProperty: 'tokenData',
        })
    );

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
