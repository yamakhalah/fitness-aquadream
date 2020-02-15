import { gql } from 'apollo-boost'

export const CREATE_USER = gql`
  mutation createUser($email: String!, $password: String!, $firstName: String!, $lastName: String!, $phone: String!, $gender: Gender!)  {
    createUser(email: $email, password: $password, firstName: $firstName, lastName: $lastName, phone: $phone, gender: $gender) {
      id
      email
      firstName
      lastName
      gender
      phone
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation resetPassword($email: String!) {
    resetPassword(email: $email) 
  }
`

export const UPDATE_IS_TEACHER = gql`
  mutation updateIsTeacher($id: ID!, $isTeacher: Boolean!) {
    updateIsTeacher(id: $id, isTeacher: $isTeacher){
      id
      isTeacher
    }
  }
`

export const UPDATE_IS_ADMIN = gql`
  mutation updateIsAdmin($id: ID!, $isAdmin: Boolean!) {
    updateIsAdmin(id: $id, isAdmin: $isAdmin) {
      id
      isAdmin
    }
  }
`

export const UPDATE_YEARLY_TAX = gql`
  mutation updateYearlyTax($id: ID!, $paidYearlyTax: Boolean!) {
    updateYearlyTax(id: $id, paidYearlyTax: $paidYearlyTax)
  }
`