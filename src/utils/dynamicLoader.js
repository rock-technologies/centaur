const fs = require('fs');
const path = require('path');

// Returns an array of imported items from the source dir.  Best used for gql types.
/* eslint-disable import/no-dynamic-require */
function loadTypes(srcDir) {
   const sourceFiles = fs.readdirSync(srcDir);
   const files = [];
   sourceFiles.forEach(file => {
      if (path.extname(file) === '.js' && file !== 'index.js') {
         files.push(require(path.join(srcDir, file)));
      }
   });

   return files;
}

// Returns an object with a property for each file found.  Best used for resolver functions.
// Naming conventions:
// If the file is called getMagic.js then resolvers will look like:
// {
//      getMagic: <contents of getMagic.js's exports>
// }
function loadResolvers(srcDir) {
   const sourceFiles = fs.readdirSync(srcDir);
   const resolvers = {};
   sourceFiles.forEach(file => {
      if (path.extname(file) === '.js' && file !== 'index.js') {
         resolvers[path.basename(file, path.extname(file))] = require(path.join(srcDir, file));
      }
   });

   return resolvers;
}


module.exports = {
   loadTypes,
   loadResolvers
};
