import { gql } from 'apollo-boost'

export const GET_SUBSCRIPTIONS_FOR_USER = gql`
  query getSubscriptionsForUser($user: ID!){
    subscriptionsForUser(user: $user){
      id
      lessonsDay{
        id
      }
      lessons{
        id
        lessonType{
          id
          name
          simpleName
        }
        lessonSubType{
          id
          name
          simpleName
        }
        recurenceBegin
        recurenceEnd
        name
      }
      payement{
        id
        mollieSubscriptionID
        molliePaymentID
        mollieMandateID
        mollieMandateStatus
        reference
      }
      created
      subType
      subStatus
      total
      totalMonth
      validityBegin
      validityEnd
    }
  }
`