export const typeDef = `
  type Authentification {
    isAuthenticated: Boolean!
    isAdmin: Boolean!
    isTeacher: Boolean!
    firstName: String!
    lastName: String!
    email: String!
    userID: ID!
    mollieCustomerID: String!
    token: String!
  }

  input AuthentificationInput {
    isAuthenticated: Boolean!
    isAdmin: Boolean!
    isTeacher: Boolean!
    firstName: String!
    lastName: String!
    email: String!
    userID: ID!
    mollieCustomerID: String!
    token: String!
  }

  type Query {
    Authentification: Authentification!
  }

  type Mutation {
    newAuthentification(input: AuthentificationInput!): Boolean!
    updateAuthentification(input: AuthentificationInput!): Boolean!
    deleteAuthentification()
  }
`

export default typeDef