import { gql } from 'apollo-server'

export default gql`
  type ErrorLog {
    id: ID!
    user: User!
    code: String!
    message: String!
  }

  extend type Query {
    errorLog(id: ID!): ErrorLog!
    errorLogs: [ErrorLog!]!
  }

  extend type Mutation {
    test(user: ID!, code: String!, message: String!): Boolean!
    createErrorLog(user: ID!, code: String!, message: String!): ErrorLog!
    deleteErrorLog(id: ID!): ErrorLog!
  }
`