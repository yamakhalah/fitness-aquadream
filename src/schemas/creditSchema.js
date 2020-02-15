import { gql } from 'apollo-server'

export default gql`
  type Credit {
    id: ID!
    user: User!
    lessonDay: LessonDay!
    isUsed: Boolean!
    validityEnd: String!
  }

  extend type Query{
    credit(id: ID!): Credit!
    credits: [Credit!]!
    creditsForUser(userID: ID!): [Credit!]!
    creditsValidity: [Credit!]!
  } 

  extend type Mutation {
    createCredit(user: ID!, lessonDay: ID!, validityEnd: String!): Credit!
    updateCredit(id: ID!, user: ID!, lessonDay: ID!, isUsed: Boolean!, validityEnd: String!): Credit!
    deleteCredit(id: ID!): Credit!
    invalidateCredit(id: ID!): Credit!
    useCredit(creditID: ID!, lessonDayID: ID!, userID: ID!): Credit!
  }
`