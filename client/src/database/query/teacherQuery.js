import {  gql } from 'apollo-boost'

export const GET_TEACHERS = gql`
  query getTeachers {
    teachers {
      id
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`