import { gql } from 'apollo-server';

export default  gql`

  enum Gender {
    MALE,
    FEMALE
  }

  input UserLightInput {
    id: ID!,
    firstName: String!,
    lastName: String!,
    email: String!
  }

  type User {
    id: ID!
    mollieCustomerID: String!,
    subscriptions: [Subscription!]
    credits: [Credit!]
    discounts: [Discount!]
    activeLessonsDay: [LessonDay!]
    email: String!
    firstName: String!
    lastName: String!
    phone: String!
    gender: Gender!
    isAdmin: Boolean!
    isTeacher: Boolean!
    paidYearlyTax: Boolean!
  }

  type Token {
    token: String!
  }

  type Authentification {
    token: String!
    user: User!
  }

  extend type Query {
    user(id: ID!): User!
    users: [User!]!
    login(email: String!, password: String!): Authentification!
    sendGlobalEmail(message: String!): Boolean!
    sendSupportEmail(user: ID!, message: String!): Boolean!
    sendMultiEmail(users: [ID!], message: String!): Boolean!
  }

  extend type Mutation {
    createUser(email: String!, password: String!, firstName: String!, lastName: String!, phone: String!, gender: Gender!): User!
    updateUser(id: ID!, subscriptions: [ID!]!, credits: [ID!]!, discounts: [ID!]!, activeLessonsDay: [ID!]!, email: String!, firstName: String!, lastName: String!, phone: String!, gender: Gender!, isAdmin: Boolean!, isTeacher: Boolean!, paidYearlyTax: Boolean!): User!
    deleteUser(id: ID!): User!
    resetPassword(email: String!): Boolean!
    changePassword(id: ID!, oldPassword: String!, newPassword: String!): Boolean!
    updateIsTeacher(id: ID!, isTeacher: Boolean!): User!
    updateIsAdmin(id: ID!, isAdmin: Boolean!): User!
    addCreditToUser(id: ID!, credit: ID!): User!
    removeCreditFromUser(id: ID!, credit: ID!): User!
    updateYearlyTax(id: ID!, paidYearlyTax: Boolean!): Boolean!
    addMollieCustomerID(id: ID!, mollieCustomerID: String!): Boolean!
  }
`;
