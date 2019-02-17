module.exports = {
   apiAudit: require('../middleware/apiAudit'),
   authenticator: require('../middleware/authenticator'),
   csrf: require('../middleware/csrf'),
   tokenParser: require('../middleware/tokenParser')
};
