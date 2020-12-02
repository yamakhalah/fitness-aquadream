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

export const GET_PAYMENT_REMINDER_BY_SUB = gql`
  query getPaymentReminderBySub($sub: ID!) {
    paymentReminderBySub(sub: $sub) {
      id
      resolved
    }
  }
`

export const GET_PAYMENTS_REMINDER = gql`
  query getPaymentsReminder {
    paymentsReminder{
      id
      user{
        id
        firstName
        lastName
        email
        phone
      }
      subscription{
        id
      }
      amount
      dueDate
      limitDate
      resolved
    }
  }
`

export const SEND_PAYMENTS_REMINDER_EMAIL = gql`
  query sendPaymentsReminderEmail($user: ID!, $paymentReminder: ID!) {
    sendPaymentsReminderEmail(user: $user, paymentReminder: $paymentReminder)
  }
`