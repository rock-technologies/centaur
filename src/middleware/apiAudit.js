const cloneDeep = require('lodash/cloneDeep');
const get = require('lodash/get');
const requestIp = require('request-ip');
const logger = require('../utils/logger');
const factory = require('../dao/DaoModelFactory');

const log = logger.child({ widget_type: 'apiAudit middleware' }, false);

/* eslint-disable no-param-reassign */
function redact(fields, object) {
   const props = Object.keys(object);
   for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (fields.includes(props[i])) {
         object[prop] = '****redacted***';
         /* eslint-disable no-continue */
         continue;
      }
      if (typeof object[prop] === 'object') {
         redact(fields, object[prop]);
      }
   }
}

module.exports = options => async (req, res, next) => {
   log.trace('API Audit running');
   if (options.sanitizeFields === false) {
      next();
      return;
   }

   const auditModel = factory.buildModel('Audit');

   // This might put too much pressure on the database.
   // It could be smarter to actually submit messages on a queue
   // instead in order to reduce the number of connections.
   // Strip out 'sensitive' data before we submit fully..
   auditModel.update({
      sessionId: get(req, 'token.sessionId'),
      username: get(req, 'token.subject.username'),
      emailAddress: get(req, 'token.subject.emailAddress'),
      entryData: redact(options.sanitizeFields, cloneDeep(req.body)),
      remoteIp: requestIp.getClientIp(req),
      userAgent: req.header('user-agent')
   });

   auditModel.persist();
   log.trace('API Audit complete');
   next();
};
