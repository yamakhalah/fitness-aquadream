import { gql } from 'apollo-boost'

export const CREATE_LESSON = gql`
  mutation createLesson($lessonsDay: [ID!]!, $lessonType: ID!, $lessonSubType: ID!, $discount: String!, $name: String!, $comment: String!, $address: AddressInput!, $pricing: PricingInput!, $totalMonth: Int!, $totalLessons: Int!, $classicDate: String!, $priorityDate: String!, $recurenceBegin: String!, $recurenceEnd: String!, $spotLeft: Int!, $spotTotal: Int!, $mainType: String!, $dateType: String!, $isOpened: Boolean!) {
    createLesson(lessonsDay: $lessonsDay, lessonType: $lessonType, lessonSubType: $lessonSubType, discount: $discount, name: $name, comment: $comment, address: $address, pricing: $pricing, totalMonth: $totalMonth, totalLessons: $totalLessons, classicDate: $classicDate, priorityDate: $priorityDate, recurenceBegin: $recurenceBegin, recurenceEnd: $recurenceEnd, spotLeft: $spotLeft, spotTotal: $spotTotal, mainType: $mainType, dateType: $dateType, isOpened: $isOpened) {
      id
    }
  }
`

export const CREATE_LESSON_AND_LESSONS_DAY = gql `
  mutation createLessonAndLessonsDay($lesson: LessonInput!, $lessonsDay: [LessonDayInput!]!) {
    createLessonAndLessonsDay(lesson: $lesson, lessonsDay: $lessonsDay)
  }
`

export const OPEN_LESSON = gql`
  mutation openLesson($id: ID!) {
    openLesson(id: $id){
      id
      users{
        id
        firstName
        lastName
      }
      lessonsDay{
        id
        lesson{
          id
        }
        teacher{
          id
          user{
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
        spotLeft
        spotTotal
        isCanceled
      }
      lessonType{
        id
        name
        simpleName
        compatibilities{
          id
        }
      }
      lessonSubType{
        id
        name
        simpleName
      }
      discount
      name
      status
      comment
      address{
        street
        city
        postalCode
      }
      pricing{
        unitPrice
        unitPrice2X
        unitPrice3X
        monthlyPrice
        monthlyPrice2X
        monthlyPrice3X
        totalPrice
        totalPrice2X
        totalPrice3X
      }
      totalMonth
      totalLessons
      classicDate
      priorityDate
      recurenceBegin
      recurenceEnd
      spotLeft
      spotTotal
      mainType
      dateType
      isOpened
    }
  }
`

export const CANCEL_LESSON = gql`
  mutation cancelLesson($id: ID!) {
    cancelLesson(id: $id)
  }
`

export const UPDATE_LESSON = gql`
  mutation updateLesson($id: ID!, $name: String!, $comment: String!, $spotLeft: Int!, $spotTotal: Int!, $pricing: PricingInput!, $recurenceBegin: String!, $recurenceEnd: String!){
    updateLesson(id: $id, name: $name, comment: $comment, spotLeft: $spotLeft, spotTotal: $spotTotal, pricing: $pricing, recurenceBegin: $recurenceBegin, recurenceEnd: $recurenceEnd){
      id
      lessonType{
        id
        name
        simpleName
        compatibilities{
          id
        }
      }
      lessonSubType{
        id
        name
        simpleName
      }
      lessonsDay{
        id
        lesson{
          id
        }
        teacher{
          id
          user{
            id
            firstName
            lastName
          }
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
      discount
      name
      status
      comment
      address{
        street
        city
        postalCode
      }
      pricing{
        unitPrice
        unitPrice2X
        unitPrice3X
        monthlyPrice
        monthlyPrice2X
        monthlyPrice3X
        totalPrice
        totalPrice2X
        totalPrice3X
      }
      totalMonth
      totalLessons
      classicDate
      priorityDate
      recurenceBegin
      recurenceEnd
      spotLeft
      spotTotal
      mainType
      dateType
      isOpened
    }
  }
`