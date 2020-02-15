import { gql } from 'apollo-boost'

export const GET_NO_SHOW_DATE = gql`
  query getNoShowDates {
    noShowDates {
      id
      begin
      end
      year
    }
  }
`