import { gql } from 'apollo-server'

export default gql`

  enum ValidateType {
    FAILED
    RETRO
  }

  type PaymentReminder {
    id: ID!
    user: User!
    subscription: Subscription!
    amount: Float!
    dueDate: String!
    limitDate: String!
    type: ValidateType!
    resolved: Boolean!
  }

  extend type Query {
    paymentReminder(id: ID!): PaymentReminder!
    paymentsReminder: [PaymentReminder!]!
    getPaymentReminderSession(id: ID!): JSON!
    sendPaymentsReminderEmail(user: ID!, paymentReminder: ID!): Boolean!
  }

  extend type Mutation {
    validatePayment(id: ID!): Boolean!
  }

`