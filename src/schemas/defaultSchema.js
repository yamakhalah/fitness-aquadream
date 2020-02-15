import { gql } from 'apollo-server';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date'

export default gql`
  scalar Date
  scalar Time
  scalar DateTime

  type HourInterval {
    begin: String!
    end: String!
  }

  input HourIntervalInput {
    begin: String!
    end: String!
  }

  type Address {
    street: String!
    city: String!
    postalCode: String!
  }

  input AddressInput {
    street: String!
    city: String!
    postalCode: String!
  }

  type Pricing {
    unitPrice: Float!
    unitPrice2X: Float!
    unitPrice3X: Float!
    monthlyPrice: Float!
    monthlyPrice2X: Float!
    monthlyPrice3X: Float!
    totalPrice: Float!
    totalPrice2X: Float!
    totalPrice3X: Float!
  }

  input PricingInput {
    unitPrice: Float!
    unitPrice2X: Float!
    unitPrice3X: Float!
    monthlyPrice: Float!
    monthlyPrice2X: Float!
    monthlyPrice3X: Float!
    totalPrice: Float!
    totalPrice2X: Float!
    totalPrice3X: Float!
  }

`