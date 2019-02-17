const query = `
  extend type Query {
    verifyToken (token: String!) : Boolean!
  }
`;

module.exports = query;
