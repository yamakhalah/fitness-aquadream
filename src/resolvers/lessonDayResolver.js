import lessonDayModel from '../models/lessonDay'
import userModel from '../models/user'
import lessonModel from '../models/lesson'
import teacherModel from '../models/teacher'
import creditModel from '../models/credit'
import mongoose from 'mongoose'
import { ApolloError } from 'apollo-server'
import { sendMail, CANCEL_LESSON_DAY, CANCEL_LESSON_DAY_BY_USER, FROM } from '../mailer'
import moment from 'moment'
moment.locale('fr')

export default {
  Query: {
    lessonDay: async (parent, { id }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.findById({ _id: id}).exec()
      return lessonDay
    },

    lessonsDay: async (parent, args, { models: { lessonDayModel }}, info) => {
      const lessonsDay = await lessonDayModel.find().exec()
      return lessonsDay
    },

    lessonsDayFromToday: async (parent, { today, offset, limit }, { models: { lessonDayModel }}, info) => {
      const lessonsDay = await lessonDayModel.find({
        dayDate: { $gte: today }
      }).skip(offset).limit(limit).sort({ dayDate: 1 })
      return lessonsDay
    },

    lessonsDaySpotCanceled: async (parent, args, { models: { lessonDayModel }}, info) => {
      var today = moment().toISOString()
      const lessonsDay = await lessonDayModel.find({
        isCanceled: false,
        spotCanceled: { $gte: 1 },
        dayDate: { $gte: today },
      })
      return lessonsDay
    },

    activeLessonsDayForUser: async (parent, { user }, { models: { lessonDayModel }}, info) => {
      var today = moment()
      today.subtract(1, 'days')
      try{
        const lessonsDay = await lessonDayModel.find({
          dayDate: { $gte: today.toISOString(true)},
          users: { $all: user }
        })
        return lessonsDay
      }catch(error){
        console.log(error)
        return {}
      }
    }
  },
  Mutation: {
    createLessonDay: async(parent, { teacher, dayDate, hour, spotLeft, spotTotal }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.create({ teacher, dayDate, hour, spotLeft, spotTotal })
      return lessonDay
    },

    updateLessonDay: async(parent, { id, lesson, teacher, users, dayDate, hour, spotLeft, spotTotal, isCanceled}, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.updateLessonDay(id, { lesson, teacher, users, dayDate, hour, spotLeft, spotTotal, isCanceled })
      return lessonDay
    },

    cancelLessonDay: async(parent, { id, lesson, teacher, users, dayDate, hour, spotLeft, spotTotal, isCanceled, message}, { models: { lessonDayModel }}, info) => {
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction() 
      try{
        var usersID = []
        for(var i = 0; i < users.length; i++) {
          usersID.push(users[i].id)
        }
        const lessonDay = await lessonDayModel.updateLessonDay(id, { lesson, teacher, usersID, dayDate, hour, spotLeft, spotTotal, isCanceled }, session)
        if(!lessonDay) {
          throw new ApolloError()
        }
        var validityEnd = moment(dayDate).add(1, 'y')
        var credits = []
        for(var i = 0; i < users.length; i++) {
          const credit = await creditModel.create({user: users[i].id, lessonDay: id, validityEnd: validityEnd.toISOString()}, opts)
          const tmp = await userModel.addCredit(users[i].id, credit.id, session)
          if(!credit) {
            throw new ApolloError()
          }
          credits.push(credit)
          var mail = await sendMail(FROM, users[i].email, 'Aquadream - Un cours a été annulé', CANCEL_LESSON_DAY(users[i], lessonDay, message))
        }
        await session.commitTransaction()
        session.endSession()
        return credits
      }catch(error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
      }
    },

    cancelLessonDayForUser: async(parent, { user, lessonDay }, { models: { lessonDayModel }}, info) => {
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction() 
      try{
        const graphqlLessonDay = await lessonDayModel.removeUserIncreaseSpotCanceled(lessonDay, user.id, opts)
        const existingCredit = await creditModel.findOne({ user: user.id, lessonDay: graphqlLessonDay.id })
        if(existingCredit) {
          throw new ApolloError('Un crédit existe  déjà pour cet utilisateur')
          return null
        }
        const credit = await creditModel.create({ user: user.id, lessonDay: graphqlLessonDay.id, validityEnd: moment(graphqlLessonDay.dayDate).add(1, 'y').toISOString()}, opts)
        const graphqlUser = await userModel.addCredit(user.id, credit, session)
        var mail = await sendMail(FROM, graphqlUser.email, 'Aquadream - Vous avez annulé un cours', CANCEL_LESSON_DAY_BY_USER(graphqlUser, graphqlLessonDay))
        await session.commitTransaction()
        session.endSession()
        return credit
      }catch(error){
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        return null
      }
    },

    deleteLessonDay: async(parent, { id }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.deleteLessonDay(id)
      return lessonDay
    },

    increaseSpotLeftFromLessonDay: async(parent, { id }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.increaseSpotLeft(id)
      return lessonDay
    },

    decreaseSpotLeftFromLessonDay: async(parent, { id }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.decreaseSpotLeft(id)
      return lessonDay
    },

    addLessonToLessonDay: async(parent, { id, lesson }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.addLesson(id, lesson)
      return lessonDay
    },

    addUserToLessonDay: async(parent, { id, user }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.addUser(id, user)
      return lessonDay
    },

    removeUserFromLessonDay: async(parent, { id, user }, { models: { lessonDayModel }}, info) => {
      const lessonDay = await lessonDayModel.removeUser(id, user)
      return lessonDay
    },
  },
  LessonDay: {
    users: async({ users }, args, { models: { userModel }}, info) => {
      if(users === undefined) return null
      var usersList = []
      for(const user of users) {
        var object = await userModel.findById({ _id: user}).exec()
        usersList.push(object)
      }
      console.log(usersList)
      return usersList
    },

    lesson: async({ lesson }, args, { models: { lessonModel }}, info) => {
      if(lesson === undefined) return null
      const object = await lessonModel.findById({ _id: lesson }).exec()
      return object
    },

    teacher: async({ teacher }, args, { models: { teacherModel }}, info) => {
      if(teacher === undefined) return null
      const object = await teacherModel.findById({ _id: teacher }).exec()
      return object
    }
  }
}