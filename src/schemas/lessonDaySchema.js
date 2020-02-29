import { gql } from 'apollo-server';


export default gql`
  type LessonDay {
    id: ID!
    lesson: Lesson!
    teacher: Teacher!
    users: [User!]!
    dayDate: String!
    hour: HourInterval!
    spotCanceled: Int!
    spotLeft: Int!
    spotTotal: Int!
    isCanceled: Boolean!
  }

  input LessonDayInput {
    lesson: ID
    teacher: ID!
    users: [ID!]
    dayDate: String!
    hour: HourIntervalInput!
    spotLeft: Int!
    spotTotal: Int!
    isCanceled: Boolean
  }

  extend type Query {
    lessonDay(id: ID!): LessonDay!
    lessonsDay: [LessonDay!]!
    lessonsDayFromToday(today: String!, offset: Int, limit: Int): [LessonDay!]!
    lessonsDaySpotCanceled: [LessonDay!]!
    activeLessonsDayForUser(user: ID!): [LessonDay!]!
  }

  extend type Mutation {
    createLessonDay(teacher: ID!, dayDate: String!, hour: HourIntervalInput!, spotLeft: Int!, spotTotal: Int!): LessonDay!
    updateLessonDay(id: ID!, lesson: ID!, teacher: ID!, users: [ID!]!, dayDate: String!, hour: HourIntervalInput!, spotLeft: Int!, spotTotal: Int!, isCanceled: Boolean!): LessonDay!
    cancelLessonDay(id: ID!, lesson: ID!, teacher: ID!, users: [UserLightInput!]!, dayDate: String!, hour: HourIntervalInput!, spotLeft: Int!, spotTotal: Int!, isCanceled: Boolean!, message: String!): [Credit!]!
    cancelLessonDayForUser(user: UserLightInput!, lessonDay: ID!): Credit!
    deleteLessonDay(id: ID!): LessonDay!
    increaseSpotLeftFromLessonDay(id: ID!): LessonDay!
    decreaseSpotLeftFromLessonDay(id: ID!): LessonDay!
    increaseSpotCanceledFromLessonDay(id: ID!): LessonDay!
    decreaseSpotCanceledFromLessonDay(id: ID!): LessonDay!
    addLessonToLessonDay(id: ID!, lesson: ID!): LessonDay!
    addUserToLessonDay(id: ID!, user: ID!): LessonDay!
    removeUserFromLessonDay(id: ID!, user: ID!): LessonDay!
  }
`