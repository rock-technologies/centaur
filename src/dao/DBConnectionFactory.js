function createPool() {
   try {
      const mysql = require('mysql2');
      const bluebird = require('bluebird');

      // DB Credentials are first retrieved from global.
      // If that fails, it tries off the environment.  If that fails, throw an error.
      let {
         host,
         database,
         user,
         password
      } = global.MYSQL_CREDENTIALS || {};

      if (!host || !database || !user || !password) {
         host = process.env.DB_HOST;
         database = process.env.DB_NAME;
         user = process.env.DB_USER;
         password = process.env.DB_PASS;
      }

      if (!host || !database || !user || !password) {
         throw new Error('Missing database credentials.');
      }

      const pool = mysql.createPool({
         host,
         user,
         password,
         database,
         waitForConnections: true,
         connectionLimit: 30,
         queueLimit: 0,
         Promise: bluebird
      });

      console.log(`DB connected to host: ${host}, with user name: ${user}, and database name: ${database}`);
      return pool.promise();
   } catch (error) {
      return console.error(`Could not connect - ${error}`);
   }
}

const pool = createPool();

module.exports = {
   connection: async () => pool.getConnection(),
   execute: (...params) => pool.execute(...params)
};
