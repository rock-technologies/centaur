const bcrypt = require('bcrypt');

const saltRounds = 10;

/* eslint-disable max-len */
module.exports = {
   makePassword: plainTextPassword => bcrypt.hashSync(plainTextPassword, saltRounds),
   checkPassword:
      (plainTextPassword, encryptedPassword) => bcrypt.compareSync(plainTextPassword, encryptedPassword)
};
