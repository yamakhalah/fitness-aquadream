import { gql } from 'apollo-server'

export default gql`
  type LessonSubType {
    id: ID!
    name: String!
    simpleName: String!
  }

  extend type Query {
    lessonSubType(id: ID!): LessonSubType!
    lessonsSubType: [LessonSubType!]!
  }

  extend type Mutation {
    createLessonSubType(name: String!, simpleName: String!): LessonSubType!
    deleteLessonSubType(id: ID!): LessonSubType!
  }
`