import { gql } from 'apollo-boost'

export const GET_SESSION = gql`
  query getSession($orderResume: JSON!, $preBookedLessons: JSON!, $user: JSON!,) {
    getSession(orderResume: $orderResume, preBookedLessons: $preBookedLessons, user: $user) 
  }
`

export const GET_MOLLIE_CHECKOUT_RESULT = gql`
  query getMollieCheckoutResult($paymentRef: String!){
    getMollieCheckoutResult(paymentRef: $paymentRef)
  }
`