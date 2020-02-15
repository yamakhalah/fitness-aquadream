import { gql } from 'apollo-server';

export default gql`
  type Discount {
    id: ID!
    user: User!
    discount: String!
    value: Float!
    validityEnd: String!
  }

  extend type Query {
    discount(id: ID!): Discount!
    discounts: [Discount!]!
  }

  extend type Mutation {
    createDiscount(user: ID!, discount: String!, value: Float!, validityEnd: String!): Discount!
    updateDiscount(id: ID!, user: ID!, discount: String!, value: Float!, validityEnd: String!): Discount!
    deleteDiscount(id: ID!): Discount!
  }
`