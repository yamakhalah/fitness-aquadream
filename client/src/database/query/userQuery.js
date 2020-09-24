import { gql } from 'apollo-boost'

export const GET_USERS = gql`
  query getUsers {
    users {
      id
      mollieCustomerID
      firstName
      lastName
      phone
      email
      gender
      credits{
        id
      }
      isTeacher
      isAdmin
    }
  }
`

export const GET_USER_BY_ID = gql`
  query getUserByID($id: ID!) {
    user(id: $id){
      id
      mollieCustomerID
      subscriptions{
        id
        payement{
          id
          mollieSubscriptionID
          molliePaymentID
          mollieMandateID
          mollieMandateStatus
          reference
        }
        lessonsDay{
          id
        }
        lessons{
          id
        }
        created
        subType
        subStatus
        total
        totalMonth
        validityBegin
        validityEnd
      }
      credits{
        id
      }
      discounts{
        id
        discount,
        value
        validityEnd
      }
      activeLessonsDay{
        id
      }
      isAdmin
      isTeacher
      paidYearlyTax
      email
      firstName
      lastName
      phone
      gender
    }
  }
`

export const LOGIN = gql`
  query login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          mollieCustomerID
          subscriptions {
            id
          }
          credits {
            id
          }
          discounts {
            id
          }
          activeLessonsDay {
            id
          }
          email
          firstName
          lastName
          phone
          gender
          isAdmin
          isTeacher
        }
      }
  }
`

export const SEND_GLOBAL_EMAIL = gql`
  query sendGlobalEmail($message: String!) {
    sendGlobalEmail(message: $message)
  }
`

export const SEND_MULTI_EMAIL = gql`
  query sendMultiEmail($users: [ID!], $message: String!) {
    sendMultiEmail(users: $users, message: $message)
  }
`

export const SEND_SUPPORT_EMAIL = gql`
  query sendSupportEmail($user: ID!, $message: String!) {
    sendSupportEmail(user: $user, message: $message)
  }
`