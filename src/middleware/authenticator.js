const logger = require('../utils/logger');
const factory = require('../dao/DaoModelFactory');

const log = logger.child({ widget_type: 'authenticator middleware' }, false);

module.exports = (options = {}) => async (req, res, next) => {
   log.trace('Authenticator running');

   const {
      ignoredQueries = [],
      ignoredMutations = [],
      ignoredPaths = []
   } = options;

   const ignoredPayloads = ignoredQueries.concat(ignoredMutations);

   try {
      if (ignoredPaths.includes(req.baseUrl)) {
         log.trace(`Skipping authentication for route: ${req.baseUrl}`);
         next();
         return;
      }

      if (ignoredPayloads.includes(req.body.operationName)) {
         log.trace(`Skipping authentication for ${req.body.operationName}.`);
         next();
         return;
      }

      const subject = req.token;
      if (!subject) {
         log.error('Authentication info missing.  Access forbidden');
         // Bypass this check if we are running local.  Allows playground to work anonymously.
         if (process.env.NODE_ENV !== 'local') {
            log.warn('Bypassing authentication.  Local build.');
            res.status(403).json({
               status: 403,
               message: 'FORBIDDEN'
            });
         } else {
            next();
         }
         return;
      }

      const userModel = factory.buildModel('User');
      const results = userModel.find({ id: subject.userId });

      if (results.length === 0) {
         log.error('Could not find user.  Access forbidden');
         res.status(403).json({
            status: 403,
            message: 'FORBIDDEN'
         });
         return;
      }

      if (results.length > 1) {
         log.error('Found multiple users.  Access forbidden');
         res.status(403).json({
            status: 403,
            message: 'FORBIDDEN'
         });
         return;
      }

      // Put the User's record on the request.
      /* eslint-disable prefer-destructuring */
      req.userRecord = userModel[0];
      log.debug(`User authenticated as ${subject.emailAddress}`);
      log.trace('Authenticator complete');
      next();
   } catch (error) {
      log.error(`Failed to check authentication: ${error}`);
      res.status(403).json({
         status: 403,
         message: 'FORBIDDEN'
      });
   }
};
