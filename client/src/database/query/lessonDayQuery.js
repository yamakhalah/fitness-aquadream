import { gql } from 'apollo-boost'

export const GET_LESSONS_DAY_FROM_TODAY = gql`
  query getLessonsDayFromToday($today: String! $offset: Int, $limit: Int){
    lessonsDayFromToday(today: $today, offset: $offset, limit: $limit){
      id
      lesson{
        id
        name
      }
      teacher{
        id
        user{
          id
          firstName
          lastName
        }
      }
      users{
        id
        email
        firstName
        lastName
      }
      dayDate
      hour{
        begin
        end
      }
      spotLeft
      spotTotal
      isCanceled
    }
  }
`

export const GET_LESSONS_DAY_SPOT_CANCELED = gql`
  query getLessonsDaySpotCanceled{
    lessonsDaySpotCanceled{
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
      teacher{
        id
        user{
          id
          firstName
          lastName
        }
      }
      users{
        id
      }
      dayDate
      hour{
        begin
        end
      }
      spotCanceled
    }
  }
`

export const GET_LESSONS_DAY_SPOT_CANCELED_BY_CAT = gql`
  query getLessonsDaySpotCanceledByCat($cat: LessonType!, $subCat: LessonSubType!){
    getLessonsDaySpotCanceledByCat(cat: $cat, subCat: $subCat){
      id
      lesson{
        id
        name
      }
      teacher{
        id
        user{
          id
          firstName
          lastName
        }
      }
      users{
        id
      }
      dayDate
      hour{
        begin
        end
      }
      spotCanceled
    }
  }
`

export const GET_ACTIVE_LESSONS_DAY_FOR_USER = gql`
  query getActiveLessonsDayForUser($user: ID!){
    activeLessonsDayForUser(user: $user){
      id
      lesson{
        id
        lessonType{
          id
          simpleName
        }
        lessonSubType{
          id
          simpleName
        }
        address{
          street
          city
          postalCode
        }
        name
        comment
        recurenceBegin
        recurenceEnd
      }
      isCanceled
      teacher{
        id
      },
      dayDate
      hour{
        begin
        end
      }
    }
  }
`





