import { gql } from 'apollo-boost'

export const PRE_SUBSCRIBE_TO_LESSONS = gql `
  mutation preSubscribeToLessons($preBookedLessons: JSON!, $user: JSON!){
    preSubscribeToLessons(preBookedLessons: $preBookedLessons, user: $user)
  }
`