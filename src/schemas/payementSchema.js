import { gql } from 'apollo-server';

export default gql`
  scalar JSON 
  
  enum PayementStatus {
    valid
    pending
    invalid
  }

  type Payement {
    id: ID!
    subscription: Subscription
    mollieSubscriptionID: String!
    molliePaymentID: String!
    mollieMandateID: String!
    mollieMandateStatus: PayementStatus!
    reference: String!
  }

  extend type Query {
    payement(id: ID!): Payement!
    payements: [Payement!]!
    getSession(orderResume: JSON!, user: JSON!, preBookedLessons: JSON!): JSON!
    getMollieCheckoutResult(paymentRef: String!): JSON!
    getMollieSubscriptionData(mollieCustomerID: String!, mollieSubscriptionID: String!): JSON!
    doNotCallAGAIN: Boolean!

  }

  extend type Mutation {
    createPayement(mollieSubscriptionID: String!, molliePaymentID: String!, mollieMandateID: String!, mollieMandateStatus: PayementStatus!, reference: String!): Payement!
    updatePayement(subscription: ID!, mollieSubscriptionID: String!, molliePaymentID: String!, mollieMandateID: String!, mollieMandateStatus: PayementStatus!, reference: String!): Payement!
    deletePayement(id: ID!): Payement! 
    addSubscriptionToPayement(id: ID!, subscription: ID!): Boolean!
    preSubscribeToLessons(preBookedLessons: JSON!, user: JSON!): Boolean!
  }
`