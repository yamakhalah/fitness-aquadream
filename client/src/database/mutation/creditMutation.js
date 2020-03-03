import { gql } from 'apollo-boost'

export const USE_CREDIT = gql`
  mutation useCredit($credit: ID!, $lessonDay: ID!, $user: ID!) {
    useCredit(creditID: $credit, lessonDayID: $lessonDay, userID: $user) {
      id
    }
  }
`

export const INVALIDATE_CREDIT = gql`
  mutation invalidateCredit($id: ID!){
    invalidateCredit(id: $id){
      id
    }
  }
`

export const UPDATE_CREDIT = gql`
  mutation updateCredit($id: ID!, $user: ID!, $lessonDay: ID!, $isUsed: Boolean!, $validityEnd: String!){
    updateCredit(id: $id, user: $user, lessonDay: $lessonDay, isUsed: $isUsed, validityEnd: $validityEnd) {
      id
    }
  }
`