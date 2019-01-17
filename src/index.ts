import 'reflect-metadata';
import './env.ts';

import * as TypeORM from 'typeorm';
import * as TypeGraphQL from 'type-graphql';
import * as jwt from 'express-jwt';

import { ApolloServer } from 'apollo-server-express';
import { formatError } from 'apollo-errors';
import * as Express from 'express';
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

    const apolloServer = new ApolloServer({
        schema,
        formatError,
        // formatError: formatArgumentValidationError,
        context: ({ req, res }: any): Context => {
            return {
                tokenData: req.tokenData
            }
        },
    });

    const app = Express();

    app.use('/graphql',
        jwt({
            secret: process.env.JWT_SECRET,
            credentialsRequired: false,
            userProperty: 'tokenData',
        })
    );

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("server started on http://localhost:4000/graphql");
    });
}

try {
    bootstrap();
} catch (error) { console.log('error', error) }
