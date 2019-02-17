const DaoModel = require('./DaoModel');
const db = require('./DBConnectionFactory');

const detectType = type => {
   if (type.indexOf('char') > -1) return 'string';
   if (type.indexOf('bool') > -1) return 'boolean';
   if (type.indexOf('decimal') > -1) return 'float';
   if (type.indexOf('int') > -1) return 'integer';
   if (type.indexOf('binary') > -1) return 'binary';
   if (type.indexOf('json') > -1) return 'json';
   if (type.indexOf('timestamp') > -1) return 'string';
   if (type.indexOf('date') > -1) return 'string';
   if (type.indexOf('text') > -1) return 'string';
   throw new Error('Unknown type detected');
};

class ModelFactory {
   constructor() {
      this.models = {};
      this.currentModels = [];
   }

   // Called whenever a model is needed for usage.
   buildModel(name) {
      let target = this.currentModels[name];

      if (!target) {
         target = new DaoModel(name, this.models[name]);
         this.currentModels[name] = target;
      }

      return target.clone();
   }

   // Should be run during the application's startup phase.
   async buildModels() {
      const conn = await db.connection();

      const tableResult = await conn.execute('SHOW TABLES;');
      const tables = tableResult[0];
      return Promise.all(tables.map(async table => new Promise(resolve => {
         const tableName = Object.keys(table)[0];
         conn.execute(`SHOW COLUMNS FROM ${table[tableName]};`).then(colResult => {
            const model = colResult[0].reduce((accum, column) => {
               const type = detectType(column.Type.toLowerCase());

               accum.push({ name: column.Field, type, isRequired: column.Null === 'NO' });
               return accum;
            }, []);

            this.models[table[tableName]] = model;
            resolve(model);
         });
      })));
   }

   getModelTypes() {
      return this.models;
   }
}

module.exports = new ModelFactory();
