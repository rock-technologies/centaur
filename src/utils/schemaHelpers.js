function addDirectives(authRole) {
   if (authRole) return `@isAuthorized(role: "${authRole}")`;
   return '';
}

function getGqlType(dbType, isRequired) {
   let retVal;
   if (dbType === 'string' || dbType === 'binary') retVal = 'String';
   if (dbType === 'boolean') retVal = 'Boolean';
   if (dbType === 'float') retVal = 'Float';
   if (dbType === 'integer') retVal = 'Int';
   if (dbType === 'json') retVal = 'JSON';

   if (!retVal) {
      throw new Error(`Invalid type found: ${dbType}`);
   }

   return isRequired ? `${retVal}!` : retVal;
}

function buildFieldList(fields, privateFields) {
   if (privateFields === false) {
      return null;
   }

   return fields.filter(
      fieldObject => !privateFields.includes(fieldObject.name)
   ).reduce((accum, field) => {
      if (accum === '') {
         return `${field.name}: ${getGqlType(field.type, field.isRequired)}`;
      }
      return `${accum}, ${field.name}: ${getGqlType(field.type, field.isRequired)}`;
   }, '');
}

function buildGetSchema(modelName, isProtected = true, authRole = null) {
   return `extend type Query { ${modelName}s (id: String): [${modelName}]! ${addDirectives(isProtected, authRole)} }`;
}

function buildCreateUpdateSchema(
   modelName,
   fields,
   isProtected = true,
   authRole = null,
   privateFields
) {
   return privateFields === false
      ? null
      : `extend type Mutation { ${modelName} (${buildFieldList(fields, privateFields)}): ${modelName} ${addDirectives(isProtected, authRole)} }`;
}

function buildTypeSchema(modelName, fields, privateFields = []) {
   if (privateFields === false) return null;
   return `type ${modelName} {${buildFieldList(fields, privateFields)}}`;
}

module.exports = {
   buildGetSchema,
   buildCreateUpdateSchema,
   buildTypeSchema
};
