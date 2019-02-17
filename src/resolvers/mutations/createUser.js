const moment = require('moment');
const { ApolloError } = require('apollo-server-express');
const get = require('lodash/get');
const logger = require('../../utils/logger');
const factory = require('../../dao/DaoModelFactory');
const { makePassword } = require('../../utils/passwordUtils');

const MYSQL_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const resolver = async (_, args, { token }) => {
   const log = logger.child({ widget_type: 'resolver createUser' });

   const userModel = factory.buildModel('User');

   try {
      const { userBlocked } = args;

      const params = {
         ...args,
         password: makePassword(args.password),
         createdByEmail: get(token, 'subject.emailAddress', 'anonymous'),
         userBlockedTimestamp: userBlocked ? moment().utc().format(MYSQL_TIMESTAMP_FORMAT) : null
      };

      userModel.update(params);
      const result = await userModel.persist();
      return result ? { id: result, ...userModel.get() } : null;
   } catch (error) {
      log.error(`Create user failed: ${error}`);
      throw new ApolloError('Operation failed');
   }
};

module.exports = resolver;
