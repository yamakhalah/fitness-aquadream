import { gql } from 'apollo-boost'

export const CREATE_LESSON_DAY = gql`
  mutation createLessonDay($teacher: ID!, $dayDate: String!, $hour: HourIntervalInput!, $spotLeft: Int!, $spotTotal: Int!) {
    createLessonDay(teacher: $teacher, dayDate: $dayDate, hour: $hour, spotLeft: $spotLeft, spotTotal: $spotTotal) {
      id
    }
  }
`

export const ADD_LESSON_TO_LESSON_DAY = gql`
  mutation addLessonToLessonDay($id: ID!, $lesson: ID!) {
    addLessonToLessonDay(id: $id, lesson: $lesson) {
      id
    }
  }
`

export const UPDATE_LESSON_DAY = gql`
  mutation updateLessonDay($id: ID!, $lesson: ID!, $teacher: ID!, $users: [ID!]!, $dayDate: String!, $hour: HourIntervalInput!, $spotLeft: Int!, $spotTotal: Int!, $isCanceled: Boolean!){
    updateLessonDay(id: $id, lesson: $lesson, teacher: $teacher, users: $users, dayDate: $dayDate, hour: $hour, spotLeft: $spotLeft, spotTotal: $spotTotal, isCanceled: $isCanceled) {
      id
    }
  }
`

export const CANCEL_LESSON_DAY = gql`
  mutation cancelLessonDay($id: ID!, $lesson: ID!, $teacher: ID!, $users: [UserLightInput!]!, $dayDate: String!, $hour: HourIntervalInput!, $spotLeft: Int!, $spotTotal: Int!, $isCanceled: Boolean!, $message: String!){
    cancelLessonDay(id: $id, lesson: $lesson, teacher: $teacher, users: $users, dayDate: $dayDate, hour: $hour, spotLeft: $spotLeft, spotTotal: $spotTotal, isCanceled: $isCanceled, message: $message) {
        id
        lessonDay{
          id
        }
        user{
          id
        }
        validityEnd
    }
  }
`

export const CANCEL_LESSON_DAY_FOR_USER = gql`
  mutation cancelLessonDayForUser($user: UserLightInput!, $lessonDay: ID!){
    cancelLessonDayForUser(user: $user, lessonDay: $lessonDay){
      id
      lessonDay{
        id
      }
      user{
        id
      }
      validityEnd
    }
  }
`