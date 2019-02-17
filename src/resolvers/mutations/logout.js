const moment = require('moment');
const { ApolloError } = require('apollo-server-express');
const logger = require('../../utils/logger');
const factory = require('../../dao/DaoModelFactory');

const MYSQL_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const resolver = async (_, args, { req: token }) => {
   const log = logger.child({ widget_type: 'resolver logout' });

   try {
      const { sessionId } = token;
      const model = factory.buildModel('Session');
      const result = await model.find({ id: sessionId });

      if (result.length === 0) {
         log.error(`Session was not found.  Id searched: ${sessionId}`);
         return false;
      }
      const values = result[0];
      values.isActive = 0;
      values.updatedTimestamp = moment().utc().format(MYSQL_TIMESTAMP_FORMAT);

      model.update({ ...values });
      await model.persist();
      return true;
   } catch (error) {
      log.error(error);
      throw new ApolloError('An error occurred.');
   }
};

module.exports = resolver;
