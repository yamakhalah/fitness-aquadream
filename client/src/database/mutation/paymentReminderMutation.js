import { gql } from 'apollo-boost'

export const VALIDATE_PAYMENT = gql`
  query validatePayment($id: ID!) {
    validatePayment(id: $id)
  }
`