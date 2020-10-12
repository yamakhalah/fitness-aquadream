import { gql } from 'apollo-server'

export default gql`
  type PaymentReminder {
    id: ID!
    user: User!
    subscription: Subscription!
    amount: Float!
    dueDate: String!
    limitDate: String!
    resolved: Boolean!
  }

  extend type Query {
    paymentReminder(id: ID!): PaymentReminder!
    paymentsReminder: [PaymentReminder!]!
    getPaymentReminderSession(id: ID!): JSON!
  }

`