import { gql } from 'apollo-boost'

export const GET_AUTHENTIFICATION = gql`
  query GET_AUTHENTIFICATION {
    Authentification @client {
      isAuthenticated
      isAdmin
      isTeacher
      firstName
      lastName
      email
      userID
      mollieCustomerID
      token
    }
  }
`

export const NEW_AUTHENTIFICATION = gql`
  mutation NEW_AUTHENTIFICATION ($input: AuthentificationInput!) {
    newAuthentification(input: $input) @client
  }
`

export const DELETE_AUTHENTIFICATION = gql`
  mutation DELETE_AUTHENTIFICATION {
    deleteAuthentification @client
  }
`

export const UPDATE_AUTHENTIFICATION = gql `
  mutation UPDATE_AUTHENTIFICATION ($input: AuthentificationInput!) {
    updateAuthentification(input: $input) @client {
      isAuthenticated
      isAdmin
      isTeacher
      firstName
      lastName
      email
      userID
      mollieCustomerID
      token
    }
  }
`