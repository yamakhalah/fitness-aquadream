import { gql } from 'apollo-boost'

export const ADMIN_CREATE_DISCOUNT = gql`
  mutation adminCreateDiscount($user: ID!, $value: Float!) {
    adminCreateDiscount(user: $user, value: $value){
      id
    }
  }
`