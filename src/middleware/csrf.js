const logger = require('../utils/logger');

const COOKIE_NAME = 'DS-CSRF-TOKEN';
const log = logger.child({ widget_type: 'CSRF middleware' }, false);

// Performs CSRF check using the double submit method.  It compares the token in the jwt,
// with the token in the header.  If they are equal, we're good.  If not, we have a hijack attempt.
module.exports = options => (req, res, next) => {
   const {
      ignoredMethods = ['GET', 'OPTIONS', 'HEAD'],
      ignoredMutations = []
   } = options;

   if (ignoredMethods.includes(req.method)) {
      log.trace(`Ignoring ${req.method} request`);
      next();
      return;
   }

   const spaceIndex = req.body.query.indexOf(' ');
   const operationType = req.body.query.substr(0, spaceIndex);
   const operationName = req.body.query.substr(spaceIndex + 1, req.body.query.indexOf('(') - spaceIndex - 1);

   if (operationType === 'query') {
      log.trace('Ignoring queries.');
      next();
      return;
   }

   if (ignoredMutations.includes(operationName)) {
      log.trace(`Ignored mutation ${operationName}`);
      next();
      return;
   }

   const headerValue = req.header('X-CSRF-Token');
   const tokenValue = req.token.csrfToken;

   if (headerValue !== tokenValue) {
      log.error('CSRF token verification failed.  Two values are not equal.');
      res.status(403).json({
         status: 403,
         message: 'FORBIDDEN'
      });
      return;
   }

   next();
};
