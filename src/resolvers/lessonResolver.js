import lessonModel from '../models/lesson'
import lessonDayModel from '../models/lessonDay'
import teacherModel from '../models/teacher'
import userModel from '../models/user'
import mongoose, { mongo } from 'mongoose'
import moment from 'moment'
import { sendMail, FROM, OPEN_LESSON } from '../mailer'
import { ApolloError } from 'apollo-server';
import LessonDay from '../models/lessonDay';

moment.locale('fr')

export default {
  Query: {
    lesson: async (parent, { id }, { models: { lessonModel }}, info) => {
      const lesson = await lessonModel.findById({ _id: id}).exec()
      return lesson
    },

    lessons: async (parent, args, { models: { lessonModel }}, info) => {
      const lessons = await lessonModel.find().exec()
      return lessons
    },

    lessonsWaitingOrGoing: async (parent, args, { models: { lessonModel }}, info) => {
      try{
        var today = moment().add(2, 'hours').toISOString(true)
        const lessons = await lessonModel.find({ 
          'status': ["WAITING_BEGIN", "ON_GOING"],
          'classicDate': { $lte: today}
        }).sort({ recurenceBegin: 1, name: 1}).exec()
        return lessons
      }catch(error){
        console.log(error)
      }
    },

    lessonsWaitingOrGoingFree: async (parent, args, { models: { lessonModel }}, info) => {
      try{
        var today = moment().add(2, 'hours').toISOString(true)
        const lessons = await lessonModel.find({ 
          'status': ["WAITING_BEGIN", "ON_GOING"],
          'spotLeft': { $gt: 0}
        }).sort({ recurenceBegin: 1, name: 1}).exec()
        return lessons ? lessons : []
      }catch(error){
        console.log(error)
        return []
      }
    }
  },
  Mutation: {
    createLesson: async(parent, { lessonsDay, lessonType, lessonSubType, teacher, discount, name, comment ,address, pricing, totalMonth, totalLessons, classicDate, priorityDate, recurenceBegin, recurenceEnd, spotLeft, spotTotal, mainType, dateType, isOpened }, { models: { lessonModel }}, info) => {
      const lesson = await lessonModel.create({ lessonsDay, lessonType, lessonSubType, teacher, discount, name, comment ,address, pricing, totalMonth, totalLessons, classicDate, priorityDate, recurenceBegin, recurenceEnd, spotLeft, spotTotal, mainType, dateType, isOpened })
      return lesson
    },

    createLessonAndLessonsDay: async(parent, { lesson, lessonsDay }, { models: { lessonModel, lessonDayModel }}, info) => {
      const lessonsDayID = []
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()  
      try {
        for(const element of lessonsDay){
          const mLessonDay = await lessonDayModel.create(element, opts)
          lessonsDayID.push(mLessonDay.id)
        }
        lesson.lessonsDay = lessonsDayID
        const mLesson = await lessonModel.create(lesson, opts)
        for(const lessonDayID of mLesson.lessonsDay){
          const tmp = await lessonDayModel.addLesson(lessonDayID, mLesson.id, opts)
        }
        await session.commitTransaction()
        session.endSession()
        return true
      } catch(error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        throw new ApolloError('Error')
      }
    },

    updateLesson: async(parent, { id, name, comment, spotLeft, spotTotal, pricing, recurenceBegin, recurenceEnd, teacher }, { models: { lessonModel }}, info) => {
      const session = await mongoose.startSession()
      session.startTransaction()
      try{
      var lesson = await lessonModel.findOne({ _id: id }).session(session)
      const spotLeftChange = spotLeft - lesson.spotLeft
      const spotTotalChange = spotTotal - lesson.spotTotal
      lesson.name = name
      lesson.comment = comment
      lesson.spotLeft = spotLeft
      lesson.spotTotal = spotTotal
      lesson.pricing = pricing,
      lesson.recurenceBegin = recurenceBegin,
      lesson.recurenceEnd = recurenceEnd
      lesson.teacher = teacher
      const newLesson = await lessonModel.findOneAndUpdate(
        { _id: id },
        { name: lesson.name, comment: lesson.comment, spotLeft: lesson.spotLeft, spotTotal: lesson.spotTotal, pricing: lesson.pricing, recurenceBegin: lesson.recurenceBegin, recurenceEnd: lesson.recurenceEnd, teacher: lesson.teacher },
        { new: true } 
      ).session(session)
      for(const id of newLesson.lessonsDay) {
        var lessonDay = await lessonDayModel.findOne({ _id: id }).session(session)
        lessonDay.hour.begin = moment(newLesson.recurenceBegin).format('HH:mm')
        lessonDay.hour.end = moment(newLesson.recurenceEnd).format('HH:mm')
        lessonDay.spotLeft += spotLeftChange
        lessonDay.spotTotal += spotTotalChange
        lessonDay.teacher = teacher
        const newLessonDay = await lessonDayModel.updateLessonDay(lessonDay.id, lessonDay, session)
      }
      await session.commitTransaction()
      session.endSession()
      return newLesson
      }catch(error){
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        throw new ApolloError('Error')
      }
    },

    deleteLesson: async(parent, { id }, { models: { lessonModel }}, info) => {
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()  
      try {
        const lesson = await lessonModel.findById(id).session(session)
        for(const lessonDay of lesson.lessonsDay) {
          const cLessonDay = await lessonDayModel.findOneAndDelete({ '_id': lessonDay }).session(session)
        }
        const tmp = await lessonModel.findOneAndDelete({ _id: id }).session(session)
        await session.commitTransaction()
        session.endSession()
        return tmp
      } catch(error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        throw new ApolloError('Error')
      }
    },

    openLesson: async(parent, { id }, { models: { lessonModel }}, info) => {
      const lessonsDayID = []
      const session = await mongoose.startSession()
      const opts = { session }
      const users = []
      session.startTransaction()
      try {
        const lesson = await lessonModel.findById({ _id: id }).session(session)
        for(const userID of lesson.users) {
          const user = await userModel.findById({ _id: userID }).session(session)
          users.push(user)
        }
        lesson.spotLeft = lesson.spotTotal
        lesson.users = []
        lesson.isOpened = true
        const mLesson = await lessonModel.updateLesson(lesson.id, lesson, opts)
        for(const user of users) {
          var mail = await sendMail(FROM, user.email, 'Aquadream - Un nouveau cours est disponible !', OPEN_LESSON(user, lesson))
        }
        await session.commitTransaction()
        session.endSession()
        return mLesson
      }catch(error) {
        await session.abortTransaction()
        session.endSession()
        throw new ApolloError('Error')
      }
    },

    cancelLesson: async(parent, { id }, { models:  { lessonModel }}, info) => {
      /*
      const lessonsDayID = []
      const users = []
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()
      try {
        const lesson = await lessonModel.findById({ _id: id })
        for(const userID of lesson.users) {
          const user = await userModel.findById({ _id: userID })
          users.push(user)
        }

        await session.commitTransaction()
        session.endSession()
        return true
      } catch(error) {
        await session.abortTransaction()
        session.endSession()
        return false
      }
      */
    },

    /*
- Change lesson status
- SpotLeft = 0
- Cancel every lessonDay
- lessonDay.spotLeft = 0
- Create discount for every user which already paid
- Send email to every user
    */

    increaseSpotLeftFromLesson: async(parent, { id }, { models: { lessonModel }}, info) => {
      const lessonDay = await lessonModel.increaseSpotLeft(id)
      return lessonDay
    },

    decreaseSpotLeftFromLesson: async(parent, { id }, { models: { lessonModel }}, info) => {
      const lessonDay = await lessonModel.decreaseSpotLeft(id)
      return lessonDay
    },

    removeLessonDay: async(parent, { id, lessonDayID }, { models: { lessonModel }}, info) => {
      const lessonDay = await lessonModel.removeLesson(id, lessonDayID)
      return lessonDay
    },

    addUserToLesson: async(parent, { id, user }, { models: { lessonModel }}, info) => {
      const lessonDay = await lessonModel.addUser(id, user)
      return lessonDay
    },

    removeUserFromLesson: async(parent, { id, user }, { models: { lessonModel }}, info) => {
      const lessonDay = await lessonModel.removeUser(id, user)
      return lessonDay
    },

    putTeacherInLesson: async(parent, args, { models: { lessonModel }}, info) => {
      try{
      const lessons = await lessonModel.find()
      var updated = []
      for(const lesson of lessons) {
        const lessonDay = await lessonDayModel.findById(lesson.lessonsDay[0]._id)
        const updatedLesson = await lessonModel.findOneAndUpdate(
          { _id: lesson._id },
          { teacher: lessonDay.teacher._id },
          { new: true}
        )
        updated.push(updatedLesson)
      }
      return updated
      }catch(error){
        console.log(error)
      }
    }
  },
  Lesson: {
    lessonsDay: async ({ lessonsDay }, args, { models: { lessonDayModel }}, info) => {
      if(lessonsDay === undefined) return null
      /*
      var lessonsList = []
      lessonsDay.forEach(element => {
        var object = lessonDayModel.findById({ _id: element}).exec()
        lessonsList.push(object)
      });
      */
     var lessonsList = await lessonDayModel.find({
       _id: {
         $in: lessonsDay.map((o) => { return mongoose.Types.ObjectId(o)})
       }
     })
      return lessonsList
    },

    users: async ({ users }, args, { models: { userModel }}, info) => {
      if(users === undefined) return null
      var usersList = []
      for(const user of users) {
        var object = await userModel.findById({ _id: user}).exec()
        usersList.push(object)
      }
      return usersList
    },

    lessonType: async ({ lessonType }, args, { models: { lessonTypeModel }}, info) => {
      if(lessonType === undefined) return null
      const object = await lessonTypeModel.findById({ _id: lessonType }).exec()
      return object
    },

    lessonSubType: async ({ lessonSubType }, args, { models: { lessonSubTypeModel }}, info) => {
      if(lessonSubType === undefined) return null
      const object = await lessonSubTypeModel.findById({ _id: lessonSubType }).exec()
      return object
    },

    teacher: async({ teacher }, args, { models: { teacherModel }}, info) => {
      if(teacher === undefined) return null
      const object = await teacherModel.findById({ _id: teacher }).exec()
      return object
    }
  }
}