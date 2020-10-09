import { gql } from 'apollo-boost'

export const GET_PAYMENT_REMINDER_SESSION = gql`
  query getPaymentReminderSession($id: ID!){
    getPaymentReminderSession(id: $id)
  }
`

export const GET_PAYMENT_REMINDER = gql`
  query getPaymentReminder($id: ID!) {
    paymentReminder(id: $id) {
      id
      resolved
    }
  }
`