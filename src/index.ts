import 'reflect-metadata';

import * as TypeORM from 'typeorm';
import * as TypeGraphQL from 'type-graphql';
import jwt from 'express-jwt';
import path from 'path';

import { thumb } from './common/thumbnail';
// import { thumb } from 'node-thumbnail';

import queryComplexity from 'graphql-query-complexity';
import { fieldConfigEstimator, simpleEstimator } from 'graphql-query-complexity';

import { ApolloServer, GraphQLOptions } from 'apollo-server-express';
import { formatError } from 'apollo-errors';
import Express from 'express';
import { Container } from 'typedi';
import { Context } from './common/context.interface';
import { authChecker } from './auth-checker';

import { Invitee } from './entities/invitee';
import { Invitation } from './entities/invitation';

import { InviteeResolver } from './resolvers/invitee-resolver';
import { InvitationResolver } from './resolvers/invitation-resolver';
import { AuthResolver } from './resolvers/auth-resolver';
import { ImageResolver } from './resolvers/image-resolver';

TypeGraphQL.useContainer(Container);
TypeORM.useContainer(Container);

console.log('Starting');

async function bootstrap() {
    let schema;

    console.log('bootstrap');

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
            logging: ['error', 'warn'],
            // logger: 'advanced-console',
            // logging: true,
            dropSchema: false,
            cache: true,
        });
    } catch(e) { console.log('Typeorm DB connection error:', e) }

    try {
        schema = await TypeGraphQL.buildSchema({
            resolvers: [
                InvitationResolver,
                InviteeResolver,
                AuthResolver,
                ImageResolver
            ],
            authChecker
        });
    } catch (e) { console.log('Build schema error:', e) }

    // const apolloServer = new ApolloServer({
    const apolloServer = new ComplexServer({ // Hackily hack-hack
        schema,
        formatError,
        context: ({ req: {tokenData} }: any): Context => ({ tokenData })
    });

    const app = Express();
    try {
        app.use('/',
            jwt({
                secret: process.env.JWT_SECRET,
                credentialsRequired: false,
                userProperty: 'tokenData',
                getToken: (req) => {
                    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                        return req.headers.authorization.split(' ')[1];
                    } else if (req.query && req.query.token) {
                        return req.query.token;
                    }
                    return null;
                }
            })
        );
    } catch(e) { console.log('JWT-error:', e) }

    const validateToken: Express.RequestHandler = (req: any, resp, next) => {
        const { tokenData } = req;

        if (tokenData) {
            next();
        } else {
            resp.sendStatus(403);
        }
    };
    app.use('/static/images', validateToken, Express.static(path.resolve(__dirname, '../static/images')));
    app.use('/static/images/thumbs', validateToken, Express.static(path.resolve(__dirname, '../static/images/.thumbs')));

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("server started on http://localhost:4000/graphql");
    });
}

try {
    thumb({
        // TODO: set paths in envs, which defautlts to docker-specific
        source: path.resolve(__dirname, '../static/images'),
        destination: path.resolve(__dirname, '../static/images/.thumbs'),
        ignore: true,
        skip: true,
        // concurrency: 4,
        height: 500,
        suffix: ''
    }).then(() => bootstrap())
      .catch((error) => console.log('error', error));
} catch (e) {
    console.log('Startup error:', e);
}


// XXX: Evil hack to use graphql-cost-analysis
// https://github.com/pa-bru/graphql-cost-analysis/issues/12#issuecomment-420991259
class ComplexServer extends ApolloServer {
    async createGraphQLServerOptions(
        req: Express.Request,
        res: Express.Response
    ): Promise<GraphQLOptions> {
        const options = await super.createGraphQLServerOptions(req, res);

        return {
            ...options,
            validationRules: [
                queryComplexity(
                    {
                        // The maximum allowed query complexity, queries above this threshold will be rejected
                        maximumComplexity: 30,
                        // The query variables. This is needed because the variables are not available
                        // in the visitor of the graphql-js library
                        variables: req.body.variables,
                        // Optional callback function to retrieve the determined query complexity
                        // Will be invoked weather the query is rejected or not
                        // This can be used for logging or to implement rate limiting
                        onComplete: (complexity: number) => {
                    },
                    estimators: [
                        // Using fieldConfigEstimator is mandatory to make it work with type-graphql
                        fieldConfigEstimator(),
                        // This will assign each field a complexity of 1 if no other estimator
                        // returned a value. We can define the default value for field not explicitly annotated
                        simpleEstimator({
                            defaultComplexity: 1
                        })
                    ]
                }) as any
            ]
        };
    }
}
