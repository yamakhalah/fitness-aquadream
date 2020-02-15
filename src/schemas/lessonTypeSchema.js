import { gql } from 'apollo-server'

export default gql`
type LessonType {
  id: ID!
  name: String!
  simpleName: String!
  compatibilities: [LessonType!]!
}

extend type Query {
  lessonType(id: ID!): LessonType
  lessonsType: [LessonType!]!
}

extend type Mutation {
  createLessonType(name: String!, simpleName: String!, compatibilities: [String!]!): LessonType!
  deleteLessonType(id: ID!): LessonType!
}
`