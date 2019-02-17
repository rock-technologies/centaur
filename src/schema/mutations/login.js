const login = `
  extend type Mutation {
    # Returns the JWT for the user's session if successful.
    login (
      username: String! 
      password: Password!
    ) : LoginData
  }
`;

module.exports = login;
