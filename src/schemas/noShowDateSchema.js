import { gql } from 'apollo-server'

export default gql`
  type NoShowDate {
    id: ID!,
    begin: String!,
    end: String!,
    year: String!
  }

  extend type Query {
    noShowDate(id: ID!): NoShowDate!
    noShowDates: [NoShowDate!]!
    noShowDatesFor(year: String!): [NoShowDate!]!
  }

  extend type Mutation {
    createNoShowDate(begin: String!, end: String!, year: String!): NoShowDate!
    deleteNoShowDate(id: ID!): NoShowDate!
  }
`