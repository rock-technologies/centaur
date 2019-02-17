const GraphQLJSON = require('graphql-type-json');
const { GraphQLPassword } = require('graphql-custom-types');

const resolvers = {
   Query: {
      ...require('./queries')
   },
   Mutation: {
      ...require('./mutations')
   },
   JSON: GraphQLJSON,
   Password: new GraphQLPassword(
      8, // min length
      16, // max length
      null,
      { alphaNumeric: 1, mixedCase: 1, specialChars: null }
   )
};

module.exports = resolvers;
