import { gql } from 'apollo-server'

export default gql`
  type Teacher {
    id: ID!
    user: User!
    lessons_day: [LessonDay!]
  }

  extend type Query {
    teacher(id: ID!): Teacher!
    teachers: [Teacher!]!
  }

  extend type Mutation {
    createTeacher(user: ID!): Teacher!
    updateTeacher(id: ID!, user: ID!, lessons_day: [ID!]!): Teacher!
    deleteTeacher(id: ID!): Teacher!
  }
`