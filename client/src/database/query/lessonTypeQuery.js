import { gql } from 'apollo-boost'

export const GET_LESSON_TYPES = gql`
  query getLessonTypes{
    lessonsType{
      id
      name
      simpleName
      compatibilities{
        id
        name
        simpleName
      }
    }
  }
`