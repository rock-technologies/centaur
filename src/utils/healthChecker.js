const db = require('../dao/DBConnectionFactory');
const logger = require('./logger');

const log = logger.child({ widget_type: 'health checker' });
module.exports = async () => {
   let conn;
   let health = false;
   try {
      conn = await db.connection();
      let result = await conn.execute({
         sql: 'SELECT COUNT(*) FROM User;',
         timeout: 5000
      });

      if (Array.isArray(result) && result.length > 0) {
         health = true;
      } else {
         log.error('Failed to get successful health check from database.');
      }
   } catch (error) {
      log.error(`Database command failed: ${error}`);
   } finally {
      conn.release();
   }

   return health;
};
