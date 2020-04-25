import { gql } from 'apollo-boost'

export const GET_DISCOUNT_BY_CODE = gql`
  query getDiscountByCode($code: ID!, $user: ID!){
    discountByCode(code: $code, user: $user) {
      id
      discount
      value
      validityEnd
    }
  }
`