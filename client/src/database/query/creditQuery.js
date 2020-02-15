import { gql } from 'apollo-boost'

export const GET_CREDITS_VALIDITY = gql`
  query getCreditsValidity{
    creditsValidity{
      id
      isUsed
      user{
        id
        firstName
        lastName
      }
      lessonDay{
        id
        lesson{
          id
          name
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
        }
        dayDate
        hour{
          begin
          end
        }
      }
      validityEnd
    }
  }
`

export const GET_CREDITS_FOR_USER = gql`
  query getCreditsForUser($userID: ID!){
    creditsForUser(userID: $userID){
      id
      isUsed
      user{
        id
      }
      lessonDay{
        id
        lesson{
          id
          name
          lessonType{
            id
            simpleName
          }
          lessonSubType{
            id
            simpleName
          }
        }
        dayDate
        hour{
          begin
          end
        }
      }
      validityEnd
    }
  }
`