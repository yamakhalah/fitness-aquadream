import { gql } from 'apollo-boost'

export const VALIDATE_PAYMENT = gql`
  mutation validatePayment($id: ID!) {
    validatePayment(id: $id)
  }
`