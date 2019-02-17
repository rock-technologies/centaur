const logger = require('../utils/logger');
const { verifyToken } = require('../utils/tokenUtils');

const log = logger.child({ widget_type: 'tokenParser middleware' }, false);

module.exports = (options = {}) => async (req, res, next) => {
   log.trace('Token parser running');
   const {
      headerName = 'Authorization',
      useBearerFormat = true
   } = options;

   try {
      const header = req.header(headerName);
      let decodedToken;
      if (header) {
         log.trace(`Found the ${headerName} header.`);
         if (useBearerFormat) {
            log.trace('Configured for bearer format');
            // Assumes format of 'Bearer <jwt token here>'
            const splitHeader = header.split(' ');
            const encodedToken = splitHeader[1];
            decodedToken = await verifyToken(encodedToken, log);
            log.trace('Token decoded successfully');
         }
      }

      req.token = decodedToken;
      log.trace('Token parser complete');
      next();
   } catch (error) {
      log.error(`Reading auth token failed: ${error}`);
      res.status(500).json({
         status: 500,
         message: 'INTERNAL SERVER ERROR'
      });
   }
};
