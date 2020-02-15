import { gql } from 'apollo-boost'

export const GET_USERS = gql`
  query getUsers {
    users {
      id
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
      }
      credits{
        id
      }
      discounts{
        id
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