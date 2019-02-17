const get = require('lodash/get');
/*
This file is intended to blacklist specific fields in a model.  Not all fields should be made public
on the API.
 */

// set an option to boolean false in order to NOT auto-create the resolver for that model.
const blacklist = {
   SchoolSystem: {
      query: [],
      mutation: [
         'createdTimestamp',
         'updatedTimestamp'
      ]
   },
   Location: {
      query: [],
      mutation: [
         'createdTimestamp',
         'updatedTimestamp'
      ]
   },
   Session: {
      query: [],
      mutation: [
         'createdTimestamp',
         'updatedTimestamp',
         'expirationTimestamp'
      ]
   },
   User: {
      query: [
         'password',
         'passwordResetToken',
         'passwordResetDatetime'
      ],
      mutation: false
   },
   Audit: {
      query: false,
      mutation: false
   }
};

function getPrivateMutationFields(modelName) {
   return get(blacklist, `${modelName}.mutation`, false);
}

function getPrivateQueryFields(modelName) {
   return get(blacklist, `${modelName}.query`, false);
}

function buildQuery(modelName) {
   return getPrivateQueryFields(modelName) !== false;
}

module.exports = {
   getPrivateMutationFields,
   getPrivateQueryFields,
   buildQuery
};
