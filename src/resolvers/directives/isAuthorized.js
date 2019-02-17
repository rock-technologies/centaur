/*  eslint-disable no-param-reassign */
const get = require('lodash/get');
const logger = require('../../utils/logger');
const { verifyToken } = require('../../utils/tokenUtils');

const GENERIC_ERROR_MSG = 'Failed to Authorize.';

const isAuthorized = async (next, source, args, context) => {
   const log = logger.child({ widget_type: 'directive isAuthorized' });

   const authHeader = get(context, 'req.headers.authorization', null);
   const token = await verifyToken(authHeader, log);
   const role = get(token, 'subject.role', []);

   if (role === args.role) {
      log.info(`User ${token.subject.username} granted permission.`);
      context.token = token;
      return next();
   }

   throw new Error(GENERIC_ERROR_MSG);
};

module.exports = isAuthorized;
