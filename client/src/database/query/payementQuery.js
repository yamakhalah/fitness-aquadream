import { gql } from 'apollo-boost'

export const GET_SESSION = gql`
  query getSession($orderResume: JSON!, $preBookedLessons: JSON!, $user: JSON! $admin: Boolean!) {
    getSession(orderResume: $orderResume, preBookedLessons: $preBookedLessons, user: $user, admin: $admin) 
  }
`

export const GET_MOLLIE_CHECKOUT_RESULT = gql`
  query getMollieCheckoutResult($paymentRef: String!){
    getMollieCheckoutResult(paymentRef: $paymentRef)
  }
`

export const GET_MOLLIE_SUBSCRIPTION_DATA = gql`
  query getMollieSubscriptionData($mollieCustomerID: String!, $mollieSubscriptionID: String!){
    getMollieSubscriptionData(mollieCustomerID: $mollieCustomerID, mollieSubscriptionID: $mollieSubscriptionID)
  }
`