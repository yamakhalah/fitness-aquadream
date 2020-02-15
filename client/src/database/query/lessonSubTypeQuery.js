import { gql } from 'apollo-boost'

export const GET_LESSON_SUB_TYPES = gql`
  query getLessonSubTypes{
    lessonsSubType{
      id
      name
      simpleName
    }
  }
`