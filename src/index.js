const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const bodyParser = require('body-parser-graphql');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const healthCheck = require('./utils/healthChecker');
const db = require('./dao/DaoModelFactory');
const middleware = require('./middleware');

const isDeployed = process.env.NODE_ENV !== 'local';
const isProduction = process.env.NODE_ENV === 'production';
const GRAPHQL_ROUTE = '/graphql';

// Middleware order
// 1) Rate Limiter
// 2) CORS
// 3) Helmet
// 4) Body Parser
// 5) Token Parser
// 6) CSRF
// 7) Authenticator
// 8) API Audit
// 9) Authorization is handled by a GraphQL directive.


/* ***************************************** */
// Setup logger for this startup sequence
const log = logger.child({ widget_type: 'Server index' }, false);
/* ***************************************** */

const runServer = async () => {
   /* ***************************************** */
   // Setup database connections and build
   // model from db schema
   /* ***************************************** */
   global.MYSQL_CREDENTIALS = {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
   };

   await db.buildModels();

   /* ***************************************** */
   // Setup GraphQL Server
   /* ***************************************** */
   const typeDefs = [
      ...require('./schema/directives'),
      ...require('./schema/types'),
      ...require('./schema/queries'),
      ...require('./schema/mutations')
   ];

   const schema = makeExecutableSchema({
      typeDefs,
      resolvers: require('./resolvers'),
      directiveResolvers: require('./resolvers/directives')
   });

   const server = new ApolloServer({
      schema,
      debug: !isDeployed,
      playground: !isDeployed,
      tracing: !isProduction,
      cacheControl: true,
      engine: false,
      context: ({ req, res }) => ({ req, res }) // This is parameter 3 to each resolver (context).
   });

   /* *************************** */
   // Build and harden the server
   // TLS reliance is placed on a proxy or LB in front of this server.
   // This server will not have to deal with it.
   /* *************************** */
   const app = express();

   app.enable('trust proxy');

   const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
   });

   // CORS configuration
   app.use(cors({
      origin: isDeployed ? '*.dojosolutions.com' : '*',
      optionsSuccessStatus: 200
   }));

   // Rate limiter
   app.use(GRAPHQL_ROUTE, apiLimiter);

   // Helmet configuration
   if (process.env.NODE_ENV !== 'local') {
      app.use(helmet({
         contentSecurityPolicy: {
            directives: {
               defaultSrc: ['self']
            }
         },
         hidePoweredBy: { setTo: 'PHP 7.2.0' } // lol.  Poor hacker.  Good luck!
      }));
   }

   // Body parser
   app.use(GRAPHQL_ROUTE, bodyParser.graphql());

   // Token parser
   app.use(GRAPHQL_ROUTE, middleware.tokenParser());

   // CSRF
   app.use(GRAPHQL_ROUTE, middleware.csrf({
      ignoredMutations: ['login', 'passwordReset']
   }));

   // Authenticate request
   app.use(GRAPHQL_ROUTE, middleware.authenticator({ ignoredMutations: ['login'] }));

   // API Audit
   app.use(GRAPHQL_ROUTE, middleware.apiAudit({
      sanitizeFields: isDeployed ? ['password'] : false
   }));

   // Finish Apollo Server configuration
   server.applyMiddleware({
      app,
      onHealthCheck: () => new Promise(async (resolve, reject) => {
         healthCheck().then(() => {
            resolve(true);
         }).catch(error => {
            reject(error);
         });
      }),
      path: GRAPHQL_ROUTE
   });

   const port = process.env.PORT || 8081;
   app.listen({ port }, () => {
      log.info(`🚀  Server ready at http://localhost:${port}${server.graphqlPath}`);
   });
};

try {
   runServer();
} catch (err) {
   console.error(err);
}
