const logger = require('../../utils/logger');
const { verifyToken } = require('../../utils/tokenUtils');

const resolver = (_, args) => {
   const log = logger.child({ widget_type: 'query verifyToken' });

   return verifyToken(args.token, log);
};

module.exports = resolver;
