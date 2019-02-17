const mutation = `
  extend type Mutation {
    createUser (
      firstName: String!
      lastName: String!
      emailAddress: String!
      username: String!
      schoolSystem: String!
      defaultLocation: String!
      role: String!
      password: Password!
      userBlocked: Boolean!
    ) : User 
  }
`;

module.exports = mutation;
// @isAuthenticated(role: "School System Administrator")
