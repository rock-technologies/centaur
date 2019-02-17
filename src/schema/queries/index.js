const { loadTypes } = require('../../utils/dynamicLoader');
const { buildGetSchema } = require('../../utils/schemaHelpers');
const factory = require('../../dao/DaoModelFactory');
const { buildQuery } = require('../fieldVisibility');

const models = factory.getModelTypes();
const queryTypes = Object.keys(models).map(
   modelName => (buildQuery(modelName) === false
      ? null
      : buildGetSchema(modelName, models[modelName]))
);

const Query = `
  # the root-level Query object
  type Query {
    _null: String @deprecated
  }
`;

const queries = [
   Query,
   ...loadTypes(__dirname),
   ...queryTypes
];

module.exports = queries.filter(query => query !== null);
