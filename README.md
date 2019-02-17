# Centaur
A turn-key solution to creating a production ready, very hardened, GraphQL Server.  This repo is intended as a starting point.  You are welcome to copy the code without attribution.  

Feel free to make suggestions, or PRs.  Any contributions would be appreciated.

## Features
- API Auditing with redaction abilities for log output.
- Dynamic generation of data models using a simple ORM.  This currently **ONLY supports MySQL.**
- Generates basic resolvers to create/update all the models discovered in the database automatically.  This does include the schema definition.
- Dynamic schema and resolver generation.
- Preconfigured connection pooling for MySQL operations.
- Provides authentication and authorization layers using native GraphQL constructs.
- Comes with PlayGround interface ready to go.
- Uses bunyan logging for producing JSON based log messages.  Easily consumable for wherever you chooose to send your logs (currently goes to stdout/stderr).
- Comes with pre-configured health check endpoint for any load balancers or uptime based services.
- Provides basic user session management with Login/Logout abilities.  It issues JWTs as the output.  The raw session data is also provided outside the scope of the JWT to allow clients to do what they need.
- Ready for `snyk` package inspection.
- Security Features implemented:
	- Basic Express Helmet using the `helmet` package.
	- Rate Limiter using the `express-rate-limit` package.
	- CORS using the `cors` package.
	- CSRF using a custom double submit method that works more intuitively with GraphQL.  This uses an HTTP header and a secure HTTP only cookie.
	- Authenicator middleware is custom and uses JWTs with the `Authorization` header.
	- Logs **EVERY** graphql call by default for auditing.  This can be configured if you have a really busy/chatty application.
	- Authorization can be extended by adapting the `@Authorization` directive.
	- ORM uses prepared statements to protect against SQL Injection.

**WARNING**: This does not handle SSL/TLS termination at all.  It expects TLS to be managed by a front line system like a load balancer or reverse proxy.

## Intro

We were getting tired of having to hand role servers that were not quite up to snuff.  There are a lot of gaps, or turn key solutions that were not REALLY ready.  So, this is an opinionated collection of security features intended to keep things light-weight, fast, and secure as much as possible.  A lot of the features listed above are configurable.  This system is being used on multiple applications today:

- An e-commerce and sports based CRM for small to medium businesses.
- A nation wide application allowing public libraries to sign up patrons.
- A communication platform for the transportation industry (no not Uber or anything like that).
- More to come.

All of these systems are deployed in AWS Elastic Beanstalk sitting behind an Application Load Balancer.

The documentation on using this is light, but it should be REALLY straight forward if you spend a few minutes of tracing.  The documentation will be expanded over time.

## Quick Start
###Dependencies
- Node.js v10.10+
- Ready for MySQL 8+.

### Environment Variables
The following environment variables need to be defined:
- DB_HOST
- DB_USER
- DB_PASS
- SECRET_JWT
- DB_NAME
- SNYK_TOKEN // Optional.  Only need this if you want to run the auditing.  Not required for starting the server.
- NODE_ENV=local // We use `local` for any localhost development.  If it's local, it is considered 'not deployed'.  This relaxes some of the security measures in place to make development more smooth.

### Usage
```bash
npm install
npm start
```
or
```bash
yarn install
yarn start
```

## Documentation

Documentation is **not complete**.

What sparse documentation is available in this readme is being progressively worked on.
