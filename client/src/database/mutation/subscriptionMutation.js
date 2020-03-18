import { gql } from 'apollo-boost'

export const CHANGE_LESSON = gql`
  mutation changeLesson($subscription: ID!, $oldLesson: ID!, $newLesson: ID!) {
    changeLesson(subscription: $subscription, oldLesson: $oldLesson, newLesson: $newLesson)
  }
`