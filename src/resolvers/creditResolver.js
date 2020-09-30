import creditModel from '../models/credit'
import lessonDayModel from '../models/lessonDay'
import userModel from '../models/user'
import { ApolloError } from 'apollo-server';
import { sendMail, USE_CREDIT, FROM } from '../mailer'
import moment from 'moment'
moment.locale('fr')

export default {
  Query: {
    credit: async (parent, { id }, { models: { creditModel }}, info) => {
      const credit = await creditModel.findById({ _id: id}).exec()
      return credit
    },

    credits: async (parent, args, { models: { creditModel }}, info) => {
      const credits = await creditModel.find().exec()
      return credits
    },

    creditsForUser: async (parent, { userID }, { models: { creditModel }}, info) => {
      const credit = await creditModel.find({ 'user': { '_id': userID }}).exec()
      return credit
    },

    creditsValidity: async (parent, args, { models: { creditModel }}, info) => {
      var today = moment().toISOString(true)
      const credit = await creditModel.find({
        validityEnd: { $gte: today },
        isUsed: false
      })
      return credit
    }
  },

  Mutation: {

    createCredit: async(parent, { user, lessonDay, validityEnd }, { models: { creditModel }}, info) => {
      const credit = await creditModel.create({ user, lessonDay, validityEnd })
      return credit
    },

    updateCredit: async(parent, { id, user, lessonDay, isUsed, validityEnd }, { models: { creditModel }}, info) => {
      const credit = await creditModel.updateCredit(id, { user, lessonDay, isUsed, validityEnd })
      return credit
    },

    deleteCredit: async(parent, { id }, { models: { creditModel }}, info) => {
      const credit = await creditModel.deleteCredit(id)
      return credit
    },

    invalidateCredit: async(parent, { id }, { models: { creditModel }}, info) => {
      const credit = await creditModel.invalidateCredit(id)
      return credit
    },

    useCredit: async(parent, { creditID, lessonDayID, userID }, { models: { creditModel }}, info) => {
      var lessonDay = await lessonDayModel.findById({ _id: lessonDayID})
      if(lessonDay === null || lessonDay.spotCanceled <= 0) {
        throw new ApolloError('There is no more spot available')
      }
      lessonDay = await lessonDayModel.addUserDecreaseSpotCanceled(lessonDayID, userID)
      const credit = await creditModel.invalidateCredit(creditID)
      const user = await userModel.addActiveLessonDay(userID, lessonDayID)
      if(lessonDay === null || credit === null || user == null) {
        throw new ApolloError('Error during use of credit')
      }
      var mail = await sendMail(FROM, user.email, 'Aquadream - Vous avez annulé un cours', USE_CREDIT(user, lessonDay))
      return credit
    }
  },

  Credit: {
    user: async ({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return null
      const object = await userModel.findById({ _id: user }).exec()
      return object
    },

    lessonDay: async ({ lessonDay }, args, { models: { lessonDayModel }}, info) => {
      if(lessonDay === undefined) return null
      const object = await lessonDayModel.findById({ _id: lessonDay }).exec()
      return object
    }
  }
}