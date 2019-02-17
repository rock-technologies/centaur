const jsonwebtoken = require('jsonwebtoken');

function verifyToken(token, log) {
   return new Promise(resolve => {
      if (token.indexOf('Bearer') > -1) {
         /* eslint-disable no-param-reassign */
         /* eslint-disable  prefer-destructuring */
         token = token.split(' ')[1]; // strips out bearer and keeps the token itself.
      }

      jsonwebtoken.verify(token, process.env.SECRET_JWT, { issuer: 'DojoSolutions' }, async (error, decoded) => {
         if (error) {
            if (error.message === 'jwt expired') {
               log.info(`Token expired: ${token}`);
               resolve(false);
               return;
            }
            log.warn(`A bad token was received for verification.  Raw token: ${token}`);
            log.warn(`Error received: ${error}`);
            log.warn(`Attempted decoded value: ${decoded}`);
            resolve(false);
            return;
         }

         if (decoded) {
            log.info(`Token is valid for user: ${decoded.subject.emailAddress}`);

            resolve(decoded);
            return;
         }

         log.info('Invalid token provided.');
         resolve(false);
      });
   });
}

module.exports = {
   verifyToken
};
