import { gql } from 'apollo-server';

export default gql`

  enum DateType {
    S1
    S2
    HOLLIDAY
  }

  enum MainType {
    COLLECTIF
    INDIVIDUEL
  }

  enum StatusType {
    WAITING_BEGIN
    ON_GOING
    DONE
  }

  type Lesson {
    id: ID!
    users: [User!]!
    lessonsDay: [LessonDay!]!
    lessonType: LessonType!
    lessonSubType: LessonSubType!
    teacher: Teacher!
    discount: String!
    name: String!
    comment: String!
    address: Address!
    pricing: Pricing!
    totalMonth: Int!
    totalLessons: Int!
    classicDate: String!
    priorityDate: String!
    recurenceBegin: String!
    recurenceEnd: String!
    spotLeft: Int!
    spotTotal: Int!
    mainType: MainType!
    dateType: DateType!
    status: StatusType!
    isOpened: Boolean!
  }

  input LessonInput {
    users: [ID!]
    lessonsDay: [ID!]!
    lessonType: ID!
    lessonSubType: ID!
    teacher: ID!
    discount: String!
    name: String!
    comment: String!
    address: AddressInput!
    pricing: PricingInput!
    totalMonth: Int!
    totalLessons: Int!
    classicDate: String!
    priorityDate: String!
    recurenceBegin: String!
    recurenceEnd: String!
    spotLeft: Int!
    spotTotal: Int!
    mainType: String!
    dateType: String!
    status: String
    isOpened: Boolean!
  }

  extend type Query {
    lesson(id: ID!): Lesson!
    lessonsWaitingOrGoing: [Lesson!]!
    lessons: [Lesson!]!
  }

  extend type Mutation {
    putTeacherInLesson: [Lesson!]!
    createLesson(lessonsDay: [ID!]!, lessonType: ID!, lessonSubType: ID!, discount: String!, name: String!, comment: String!, address: AddressInput!, pricing: PricingInput!, totalMonth: Int!, totalLessons: Int!, classicDate: String!, priorityDate: String!, recurenceBegin: String!, recurenceEnd: String!, spotLeft: Int!, spotTotal: Int!, mainType: String!, dateType: String!, isOpened: Boolean!): Lesson!
    createLessonAndLessonsDay(lesson: LessonInput!, lessonsDay: [LessonDayInput!]!): Boolean
    updateLesson(id: ID!, name: String!, comment: String!, spotLeft: Int!, spotTotal: Int!, pricing: PricingInput!, recurenceBegin: String!, recurenceEnd: String!, teacher: ID!): Lesson!
    deleteLesson(id: ID!): Lesson!
    openLesson(id: ID!): Lesson!
    cancelLesson(id: ID!):  Boolean!
    removeLessonDay(id: ID!, lessonDay: ID!): Lesson!
    addUserToLesson(id: ID!, user: ID!): Lesson!
    removeUserFromLesson(id: ID!, user: ID!): Lesson!
    increaseSpotLeftFromLesson(id: ID!): Lesson!
    decreaseSpotLeftFromLesson(id: ID!): Lesson!

  }
`

/*

  enum LessonType {
    BEBE
    ENFANT
    ADULTE
  }

  enum LessonSubType {
    JARDIN_AQUATIQUE
    ACCOUTUMANCE_A_EAU
    BEBE_NAGEUR
    APPRENTISSAGE_NAGE
    PERFECTIONNEMENT_NAGE
    AQUA_SIRENE
    INITIATION_PLONGEE
    INITIATION_WATERPOLO
    AQUA_BIKING
    AQUA_FITNESS
    AQUA_RELAXATION
    AQUA_ZUMBA
    AQUA_BOXING
    PREPARATION_PRENATALE
    OSTEOPATHIE_EAU
    POST_NATAL_AQUATIQUE
  }

  */