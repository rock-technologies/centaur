const Logger = require('bunyan');

module.exports = new Logger({
   name: 'ds-server',
   streams: [
      {
         stream: process.stdout,
         level: process.env.NODE_ENV === 'production' ? 'info' : 'trace'
      }
   ]
});
