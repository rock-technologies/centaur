const difference = require('lodash/difference');
const cloneDeep = require('lodash/cloneDeep');
const get = require('lodash/get');
const uuid = require('uuid/v4');
const Promise = require('bluebird');
const Logger = require('../utils/logger');
const db = require('./DBConnectionFactory');

const log = Logger.child({ widget_type: 'DaoModel' });

async function run(command, params) {
   const conn = await db.connection();
   let result = null;
   try {
      result = await conn.execute({
         sql: command,
         timeout: 10000,
         values: params
      });
      /* eslint-disable prefer-destructuring */
      if (Array.isArray(result) && result.length > 0) {
         result = result[0];
      } else {
         result = null;
      }
   } catch (error) {
      log.error(`Failed to run query: ${error}`);
   } finally {
      conn.release();
   }
   return result;
}

module.exports = class DaoModel {
   constructor(name, fields) {
      this.values = {};
      this.name = name;
      this.expectedFields = fields.reduce((accum, field) => {
         accum.push(field.name);
         return accum;
      }, []);
      this.fieldTypes = fields;
   }

   clone() {
      const me = cloneDeep(this);
      me.values = {};
      return me;
   }

   async getById(id) {
      if (!this.values.id && !id) {
         throw new Error('No id field provided.');
      }

      try {
         return run(`SELECT * from ${this.name} WHERE id = ?`, [this.values.id || id]);
      } catch (error) {
         log.error(`Failed to retrieve by Id: ${error}`);
         return null;
      }
   }

   // Replaces all values with the input parameter.  It does NOT merge the results.
   update(data) {
      if (!data || typeof data !== 'object') {
         throw new Error('Missing data');
      }

      // Make sure there are no unexpected fields on the object to be saved.
      const diff = difference(Object.keys(data), this.expectedFields);
      if (diff.length > 0) {
         throw new Error(`Unexpected field(s) found or missing on model '${this.name}': ${diff.toString()}`);
      } else {
         this.values = { ...data };
      }

      return this;
   }

   async delete(id) {
      if (!this.values.id && !id) {
         throw new Error('Missing id field for delete operation.');
      }

      const deleteMe = this.values.id || id;

      try {
         return await run(`DELETE FROM ${this.name} WHERE id = UUID_TO_BIN(?)`, [deleteMe]);
      } catch (error) {
         log.error(`Failed to delete entry with id ${deleteMe}: ${error}`);
         return null;
      }
   }

   // Returns one or more records for the model type.  Does NOT load the model with data.
   async find(params = {}) {
      let command = 'SELECT';
      this.fieldTypes.forEach(field => {
         if (field.type === 'binary') {
            command += ` BIN_TO_UUID(${field.name}) AS ${field.name},`;
         } else {
            command += ` ${field.name},`;
         }
      });
      command = command.slice(0, -1);
      command += ` FROM ${this.name} WHERE `;

      const criteria = [];
      if (Object.keys(params).length === 0) {
         command += '1';
      } else {
         let first = true;
         let param = null;

         Object.keys(params).forEach(key => {
            param = this.fieldTypes.filter(field => (field.name === key));
            const isBinary = get(param, '[0].type', '') === 'binary';
            criteria.push(params[key]);
            if (first) {
               command += isBinary ? `${key} = UUID_TO_BIN(?)` : `${key} = ?`;
               first = false;
            } else {
               command += isBinary ? ` AND ${key} = UUID_TO_BIN(?)` : ` AND ${key} = ?`;
            }
         });
      }

      try {
         return await run(command, criteria);
      } catch (error) {
         log.error(`Failed to find record(s): ${error}`);
         return null;
      }
   }

   async persist() {
      if (Object.keys(this.values).length === 0) {
         throw new Error('No values to persist.');
      }

      let dbCommand;
      try {
         if (!this.values.id) {
            this.values.id = uuid();

            dbCommand = this.createInsert();
         } else {
            dbCommand = this.createUpdate();
         }
         const result = await run(dbCommand.command, dbCommand.params);
         return result;
      } catch (error) {
         log.error(`Failed to run persist command on model ${this.name}: ${error}`);
         log.error(`Command that failed: ${dbCommand.command}`);
         return null;
      }
   }

   // Returns an array of models with the retrieved results populated.  One model per record.
   async retrieve(params) {
      const results = await this.find(params);
      try {
         return results.map(record => (this.clone().update(record)));
      } catch (error) {
         log.error(error);
         return null;
      }
   }

   // Runs an adhoc command
   /* eslint-disable class-methods-use-this */
   async execute(preparedStatement, values) {
      try {
         return await run(preparedStatement, values);
      } catch (error) {
         log.error(`Failed to run command: ${error}`);
         return null;
      }
   }

   get(param) {
      return param ? this.values[param] : this.values;
   }

   createInsert() {
      let command = `INSERT INTO ${this.name} (`;
      const params = [];
      Object.keys(this.values).forEach(fieldName => {
         command += `${fieldName}, `;
         params.push(this.values[fieldName]);
      });

      command = command.slice(0, -2);
      command += ')';
      command += ' VALUES (';

      let targetField = null;
      Object.keys(this.values).forEach(field => {
         targetField = this.fieldTypes.find(fieldType => (fieldType.name === field));
         if (targetField.type === 'binary') {
            command += 'UUID_TO_BIN(?),';
         } else {
            command += '?,';
         }
      });

      command = command.slice(0, -1);
      command += ')';

      return { command, params };
   }

   createUpdate() {
      let command;
      const params = [];
      command = `UPDATE ${this.name} SET `;

      let targetField = null;
      Object.keys(this.values).filter(key => key !== 'id').forEach(fieldName => {
         targetField = this.fieldTypes.find(fieldType => (fieldType.name === fieldName));
         if (targetField.type === 'binary') {
            command += `${fieldName} = UUID_TO_BIN(?),`;
         } else {
            command += `${fieldName} = ?,`;
         }
         params.push(this.values[fieldName]);
      });

      command = command.slice(0, -1);
      command += ' WHERE id = UUID_TO_BIN(?)';
      params.push(this.values.id);

      return { command, params };
   }
};
