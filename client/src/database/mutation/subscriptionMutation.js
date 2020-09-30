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

export const CANCEL_SUBSCRIPTION_REFUND = gql`
  mutation cancelSubscriptionWithRefund($id: ID!){
    cancelSubscriptionWithRefund(id: $id)
  }
`

export const CANCEL_SUBSCRIPTION_NO_COMPENSATION = gql`
  mutation cancelSubscriptionNoCompensation($id: ID!){
    cancelSubscriptionNoCompensation(id: $id)
  }
`

export const PRE_CANCEL_SUBSCRIPTION =gql`
  mutation preCancelSubscription($id: ID!){
    preCancelSubscription(id: $id)
  }
`

export const ADMIN_CREATE_SUBSCRIPTION = gql`
  mutation adminCreateSubscription($orderResume: JSON!, $preBookedLessons: JSON!, $user: JSON!, $admin: Boolean!){
    adminCreateSubscription(orderResume: $orderResume, preBookedLessons: $preBookedLessons, user: $user, admin: $admin)
  }
`