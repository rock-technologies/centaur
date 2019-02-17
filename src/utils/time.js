const moment = require('moment');

module.exports = function getTimestampString() {
   return moment.utc().format('YYYY-MM-DD HH:mm:ss');
};
