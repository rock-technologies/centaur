const { loadTypes } = require('../../utils/dynamicLoader');
const { buildTypeSchema } = require('../../utils/schemaHelpers');
const factory = require('../../dao/DaoModelFactory');
const { getPrivateQueryFields } = require('../fieldVisibility');

const models = factory.getModelTypes();
const types = Object.keys(models).map(
   modelName => buildTypeSchema(modelName, models[modelName], getPrivateQueryFields(modelName))
);

module.exports = [
   'scalar JSON',
   'scalar Upload',
   'scalar Password',
   ...loadTypes(__dirname),
   ...types
].filter(type => type !== null);
