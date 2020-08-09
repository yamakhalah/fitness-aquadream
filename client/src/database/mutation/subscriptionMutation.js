import { gql } from 'apollo-boost'

export const CHANGE_LESSON = gql`
  mutation changeLesson($subscription: ID!, $oldLesson: ID!, $newLesson: ID!) {
    changeLesson(subscription: $subscription, oldLesson: $oldLesson, newLesson: $newLesson)
  }
`

export const CANCEL_SUBSCRIPTION_DISCOUNT = gql`
  mutation cancelSubscriptionWithDiscount($id: ID!){
    cancelSubscriptionWithDiscount(id: $id)
  }
`

export const ADMIN_CREATE_SUBSCRIPTION = gql`
  mutation adminCreateSubscription($payment: JSON!){
    adminCreateSubscription(payment: $payment)
  }
`