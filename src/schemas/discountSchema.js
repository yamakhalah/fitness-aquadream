import { gql } from 'apollo-server';

export default gql`
  enum DiscountStatus {
    USED
    NOT_USED
  }

  type Discount {
    id: ID!
    user: User!
    subscription: Subscription!
    discount: String!
    value: Float!
    status: DiscountStatus!
    validityEnd: String!
  }

  extend type Query {
    discount(id: ID!): Discount!
    discounts: [Discount!]!
    discountByCode(code: ID!, user: ID!): Discount

  }

  extend type Mutation {
    createDiscount(user: ID!, subscription: ID, discount: String!, value: Float!, status: DiscountStatus!, validityEnd: String!): Discount!
    updateDiscount(id: ID!, user: ID!, subscription: ID!, discount: String!, value: Float!, status: DiscountStatus!, validityEnd: String!): Discount!
    deleteDiscount(id: ID!): Discount!
    adminCreateDiscount(user: ID!, value: Float!): Discount!
  }
`