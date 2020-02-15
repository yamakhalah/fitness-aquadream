import { gql } from 'apollo-boost'

export const GET_SESSION = gql`
  query getSession($orderResume: JSON!, $user: JSON!) {
    getSession(orderResume: $orderResume, user: $user) 
  }
`