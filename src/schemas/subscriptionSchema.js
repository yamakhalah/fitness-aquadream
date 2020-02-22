import { gql } from 'apollo-server';

export default gql`
  enum SubStatus {
    WAITING_PAYEMENT
    ON_GOING
    EXPIRED
    CANCELED_BY_CLIENT
    CANCELED_BY_ADMIN
  }

  enum SubType {
    LESSON
    LESSON_DAY
  }

  type Subscription {
    id: ID!
    payement: Payement!
    user: User!
    lessonsDay: [LessonDay!]
    lessons: [Lesson!]
    created: String!
    subStatus: SubStatus!
    subType: SubType!
    total: Int!
    totalMonth: Int!
    validityBegin: String!
    validityEnd: String!
  }

  input SubscriptionInput {
    payement: ID
    user: ID!
    lessonsDay: [ID!]
    lessons: [ID!]
    created: String!
    subStatus: String!
    subType: String!
    total: Int!
    totalMonth: Int!
    validityBegin: String!
    validityEnd: String!
  }

  extend type Query {
    subscription(id: ID!): Subscription!
    subscriptions: [Subscription!]!
    subscriptionsForUser(user: ID!): [Subscription!]!
  }

  extend type Mutation {
    createSubscriptionWithLessons(subscription: SubscriptionInput!): Subscription!
    createSubscriptionWithLessonsDay(subscription: SubscriptionInput!): Subscription!
    updateSubscription(id: ID!, subscription: SubscriptionInput!): Subscription!
    deleteSubscription(id: ID!): Subscription!

  }
`