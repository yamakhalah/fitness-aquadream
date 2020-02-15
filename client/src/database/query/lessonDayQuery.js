import { gql } from 'apollo-boost'

export const GET_LESSONS_DAY_FROM_TODAY = gql`
  query getLessonsDayFromToday($today: String!){
    lessonsDayFromToday(today: $today){
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
        lessonType
        lessonSubType
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





