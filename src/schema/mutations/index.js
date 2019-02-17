const { loadTypes } = require('../../utils/dynamicLoader');
const { buildCreateUpdateSchema } = require('../../utils/schemaHelpers');
const factory = require('../../dao/DaoModelFactory');
const { getPrivateMutationFields } = require('../fieldVisibility');

const models = factory.getModelTypes();
const mutationTypes = Object.keys(models).map(
   modelName => buildCreateUpdateSchema(
      modelName,
      models[modelName],
      null,
      null,
      getPrivateMutationFields(modelName)
   )
);

const Mutation = `
  # the root-level Mutation object
  type Mutation {
    _null: String @deprecated
  }
`;

const mutations = [
   Mutation,
   ...loadTypes(__dirname),
   ...mutationTypes
];

module.exports = mutations.filter(mutation => mutation !== null);
