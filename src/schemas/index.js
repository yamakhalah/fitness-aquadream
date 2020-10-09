import userSchema from './userSchema'
import creditSchema from './creditSchema'
import defaultSchema from './defaultSchema'
import discountSchema from './discountSchema'
import lessonDaySchema from './lessonDaySchema'
import lessonSchema from './lessonSchema'
import lessonTypeSchema from './lessonTypeSchema'
import lessonSubTypeSchema from './lessonSubTypeSchema'
import payementSchema from './payementSchema'
import subscriptionSchema from './subscriptionSchema'
import teacherSchema from './teacherSchema'
import errorLogSchema from './errorLogSchema'
import noShowDateSchema from './noShowDateSchema'
import paymentReminderSchema from './paymentReminderSchema'
import { gql } from 'apollo-server'

const linkSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`

export default [paymentReminderSchema, lessonTypeSchema, lessonSubTypeSchema, linkSchema, userSchema, creditSchema, defaultSchema, discountSchema, lessonDaySchema, lessonSchema, payementSchema, subscriptionSchema, teacherSchema, errorLogSchema, noShowDateSchema]