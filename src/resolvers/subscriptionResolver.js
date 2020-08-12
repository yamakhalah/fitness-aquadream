require('dotenv').config()
import subscriptionModel from '../models/subscription'
import payementModel from '../models/payement'
import lessonModel from '../models/lesson'
import lessonDayModel from '../models/lessonDay'
import userModel from '../models/user'
import mongoose from 'mongoose'
import { ApolloError} from 'apollo-server-express'
import { sendMail, FROM, ADMIN_CREATE_SUBSCRIPTION, CANCEL_SUBSCRIPTION_DISCOUNT, PRE_CANCEL_SUBSCRIPTION } from '../mailer'
import { createMollieClient } from '@mollie/api-client'
import crypto from 'crypto'
import moment from 'moment'
moment.locale('fr')
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY })

export default {
  Query: {
    subscription: async (parent, { id }, { models: { subscriptionModel }}, info) => {
      const subscription = await subscriptionModel.findById({ _id: id}).exec()
      return subscription
    },

    subscriptions: async (parent, args, { models: { subscriptionModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.find().sort({ lastName: 1, created: 1 }).exec()
      return graphqlSubscription
    },

    subscriptionsForUser: async (parent, { user }, { models: { subscriptionModel }}, info) => {
      const subscriptions = await subscriptionModel.find({
        user: user
      }).exec()
      return subscriptions
    }
  },
  Mutation: {
    createSubscriptionWithLessons: async(parent, { subscription }, { models: { subscriptionModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.create({ subscription })
      return graphqlSubscription
    },

    createSubscriptionWithLessonsDay: async(parent, { subscription }, { models: { subscriptionModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.create({ subscription })
      return graphqlSubscription
    },

    updateSubscription: async(parent, { id, subscription }, { models: { subscriptionModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.updateSubscription(id, subscription)
      return graphqlSubscription
    },

    deleteSubscription: async(parent, { id }, { models: { subscriptionModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.deleteSubscription(id)
      return graphqlSubscription
    },

    changeLesson: async(parent, { subscription, oldLesson, newLesson }, { models: { subscriptionModel }}, info) => {
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()
      try{
        //GET SUBSCRIPTION DATA
        var graphQLSubscription = await subscriptionModel.findById(subscription).session(session)
        var user = await userModel.findById(graphQLSubscription.user).session(session)
        //GET OLD LESSON DATA
        var graphQLOldLesson = await lessonModel.findById(oldLesson).session(session)
        //GET NEW LESSON DATA
        var graphQLNewLesson = await lessonModel.findById(newLesson).session(session)

        //REMOVE USER FROM OLD LESSONS_DAY
        for(const lesson of graphQLOldLesson.lessonsDay){
          var test = await lessonDayModel.removeUserDecreaseSpotLeft(lesson, user.id, opts)
        }
        //REMOVE USER FROM OLD LESSON
        (await lessonModel).removeUser(graphQLOldLesson.id, user.id, opts)

        //ADD USER TO NEW LESSONS_DAY
        for(const lesson of graphQLNewLesson.lessonsDay){
          var test = await lessonDayModel.addUserDecreaseSpotLeft(lesson, user.id, opts)
        }
        //ADD USER TO NEW LESSON
        (await lessonModel).addUser(graphQLNewLesson.id, user.id, opts)

        //REMOVE OLD LESSON FROM SUBSCRIPTION
        //ADD NEW LESSON TO SUBSCRIPTIOn
        var graphQLNewSubscription = await subscriptionModel.changeLesson(subscription, oldLesson, newLesson, opts)
        await session.commitTransaction()
        session.endSession()
        //SEND EMAIL
        var mail = await sendMail(FROM, user.email, 'Aquadream - Modification de votre abonnement', CHANGE_SUBSCRIPTION(user, graphQLOldLesson, graphQLNewLesson))
        return true
      }catch(error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        return false
      }
    },

    adminCreateSubscription: async(parent, { orderResume, preBookedLessons, user, admin }, { models: { userModel, payementModel, subscriptionModel, lessonModel, lessonDayModel }}, info) => {
      const session = await mongoose.startSession()
      session.startTransaction()
      const opts = { session }
      const userl = user
      try{
        var lessonsID = []
        var dataLessons = []
        for(const lesson of orderResume.lessonsData){
          lessonsID.push(lesson.lesson.id)
          var graphqlLesson = await lessonModel.addUser(lesson.lesson.id, userl.id, opts)
          dataLessons.push(graphqlLesson)
          for(const lessonDay of graphqlLesson.lessonsDay) {
            var graphqlLessonDay = await lessonDayModel.addUserDecreaseSpotLeft(lessonDay, userl.id, opts)
          }
        }
        const validityBegin = moment(orderResume.recurenceBegin)
        const validityEnd = moment(orderResume.recurenceEnd)
        console.log(validityEnd)
        const dataSubscription = {
          user: userl.id,
          lessons: lessonsID,
          created: moment().toISOString(),
          subType: 'LESSON',
          total: orderResume.total,
          totalMonth: orderResume.totalMonthly,
          validityBegin: validityBegin.toISOString(),
          validityEnd: validityEnd.toISOString(),
          subStatus: 'WAITING_PAYEMENT'
        }

        const graphqlSubscription = await subscriptionModel.createWithLessons(dataSubscription, opts)
        const user = await userModel.addSubscription(userl.id, graphqlSubscription._id, opts)
        var data = {
          lessons: dataLessons,
          user: userl,
          validityBegin: validityBegin.toString(),
          validityEnd: validityEnd.toString(),
          total: graphqlSubscription.total,
          totalMonth: graphqlSubscription.totalMonth,
          subscription: graphqlSubscription._id
        }
        await session.commitTransaction()
        session.endSession()
        var mail = await sendMail(FROM, userl.email, 'Aquadream - Inscription prioritaire', ADMIN_CREATE_SUBSCRIPTION(data))
        return true
      }catch(error){
          console.log('CATCH ERROR')
          console.log(error)
          await session.abortTransaction()
          session.endSession()
          return false
      } 
    },

    /*
    cancelAllSubscriptionsWithDiscount: async(parent, { }, { models: { userModel, subscriptionModel,  payementModel, lessonModel, lessonDayModel, discountModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.find().sort({ lastName: 1, created: 1 }).exec()
      try{
        var session = await mongoose.startSession()
        var opts = { session }
        session.startTransaction()
        var counter = 0
        for(const test of graphqlSubscription) {
          console.log(test.subStatus)
          if(test.subStatus !== 'CANCELED_BY_ADMIN'){
          console.log('NEW SUB '+test._id)
          var id = test._id
          //GET SUBSCRIPTION && PAYMENT DATA
          console.log('GET SUB')
          const sub = await subscriptionModel.findById(id).populate([{ path: 'payement', model: payementModel }, { path: 'lessonsDay', model: lessonDayModel }, { path: 'lessons', model: lessonModel }, { path: 'user', model: userModel } ])
          console.log('GET MOLLIE SUB')
          const mollieSub = await mollieClient.customers_subscriptions.get(
            sub.payement.mollieSubscriptionID,
            { customerId: sub.payement.mollieCustomerID }
          )
          //COMPUTE HOW MUCH CUSTOMER ALREADY PAID BASED ON RECURENCE BEGIN AND TOTAL MONTHLY
          const refund = ((mollieSub.times - mollieSub.timesRemaining)+1) * Number(mollieSub.amount.value)
          //GENERATE DISCOUNT FOR AMOUNT PAID
          const discount = {
            user: sub.user._id,
            subscription: sub._id,
            discount: crypto.randomBytes(6).toString('hex').toUpperCase(),
            value: refund,
            status: 'NOT_USED',
            validityEnd: moment().add(1, 'years')
          }
          //CANCEL MOLLIE SUBSCRIPTION
          console.log('CREATE DISCOUNT')
          const graphqlDiscount = await discountModel.create(discount, opts)
          console.log('ADD DISCOUNT TO USER')
          var user = await userModel.addDiscount(sub.user._id, graphqlDiscount._id, session)
          console.log('OK')
          //REMOVE USER FOR EVERY LESSONS/LESSONS DAY
          if(sub.subType === 'LESSON') {
            console.log('LOOP')
            for(const lesson of sub.lessons){
              console.log('REMOVE USER FROM LESSON')
              //LESSONMODEL.removeUser
              const dLesson = await lessonModel.removeUser(lesson._id, sub.user._id, opts)
              console.log('REMOVE USER FROM LESSON DAY')
              for(const lessonDay of lesson.lessonsDay) {
                const dLessonDay = await lessonDayModel.removeUserIncreaseSpotLeft(lessonDay, sub.user._id, opts)
              }
            }
          } else {
            console.log('ELSE')
          }
          //CANCEL SUBSCRIPTION
          console.log('CANCEL SUBSCRIPTION')
          const uSub = await subscriptionModel.findOneAndUpdate(
            { _id: sub._id },
            { subStatus: 'CANCELED_BY_ADMIN'},
            { new: true }
          ).session(session)
          try{
          const newMollieSub = await mollieClient.customers_subscriptions.cancel(
            sub.payement.mollieSubscriptionID,
            { customerId: sub.payement.mollieCustomerID, }
          )
          }catch(error){
            console.log('LOW LEVEL ERROR')
          }
          console.log('OK DISCOUNT')
          counter++
          console.log(counter)
        }
        }
        console.log('END AND COMMIT')
        await session.commitTransaction()
        await session.endSession()
      }catch(error) {
        console.log('HIGH LEVEL ERROR')
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        return false
      }
      return true
    },
    */

   preCancelSubscription: async(parent, { id }, { models: { userModel, subscriptionModel,  payementModel, lessonModel, lessonDayModel, discountModel }}, info) => {
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()
      try{
        //GET SUBSCRIPTION && PAYMENT DATA
        const sub = await subscriptionModel.findById(id).populate([{ path: 'payement', model: payementModel }, { path: 'lessonsDay', model: lessonDayModel }, { path: 'lessons', model: lessonModel }, { path: 'user', model: userModel } ])
        //COMPUTE HOW MUCH CUSTOMER ALREADY PAID BASED ON RECURENCE BEGIN AND TOTAL MONTHLY
        if(sub.subType === 'LESSON') {
          for(const lesson of sub.lessons){
            //LESSONMODEL.removeUser
            const dLesson = await lessonModel.removeUser(lesson._id, sub.user._id, opts)
            for(const lessonDay of lesson.lessonsDay) {
              const dLessonDay = await lessonDayModel.removeUserIncreaseSpotLeft(lessonDay, sub.user._id, opts)
            }
          }
        } else {
          console.log('ELSE')
        }
        //CANCEL SUBSCRIPTION
        const user = await userModel.removeSubscription(sub.user._id, sub._id, opts)
        const uSub = await subscriptionModel.findOneAndUpdate(
          { _id: sub._id },
          { subStatus: 'CANCELED_BY_ADMIN'},
          { new: true }
        ).session(session)
        await session.commitTransaction()
        session.endSession()
        //SEND EMAIL
        var mail = await sendMail(FROM, sub.user.email, 'Aquadream - Abonnement annulé', PRE_CANCEL_SUBSCRIPTION(sub))
        return true
      }catch(error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        return false
      }
   },

    cancelSubscriptionWithDiscount: async(parent, { id }, { models: { userModel, subscriptionModel,  payementModel, lessonModel, lessonDayModel }}, info) => {
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()
      try{
        //GET SUBSCRIPTION && PAYMENT DATA
        const sub = await subscriptionModel.findById(id).populate([{ path: 'payement', model: payementModel }, { path: 'lessonsDay', model: lessonDayModel }, { path: 'lessons', model: lessonModel }, { path: 'user', model: userModel } ])
        const mollieSub = await mollieClient.customers_subscriptions.get(
          sub.payement.mollieSubscriptionID,
          { customerId: sub.payement.mollieCustomerID }
        )
        //COMPUTE HOW MUCH CUSTOMER ALREADY PAID BASED ON RECURENCE BEGIN AND TOTAL MONTHLY
        const refund = ((mollieSub.times - mollieSub.timesRemaining)+1) * Number(mollieSub.amount.value)
        //GENERATE DISCOUNT FOR AMOUNT PAID
        const discount = {
          user: sub.user._id,
          subscription: sub._id,
          discount: crypto.randomBytes(6).toString('hex').toUpperCase(),
          value: refund,
          status: 'NOT_USED',
          validityEnd: moment().add(1, 'years')
        }
        //CANCEL MOLLIE SUBSCRIPTION
        const graphqlDiscount = await discountModel.create(discount, { opts })
        var user = await userModel.addDiscount(sub.user._id, graphqlDiscount._id, session)
        user = await userModel.removeSubscription(sub.user._id, sub._id, opts)
        //REMOVE USER FOR EVERY LESSONS/LESSONS DAY
        if(sub.subType === 'LESSON') {
          for(const lesson of sub.lessons){
            //LESSONMODEL.removeUser
            const dLesson = await lessonModel.removeUser(lesson._id, sub.user._id, opts)
            for(const lessonDay of lesson.lessonsDay) {
              const dLessonDay = await lessonDayModel.removeUserIncreaseSpotLeft(lessonDay, sub.user._id, opts)
            }
          }
        } else {
          console.log('ELSE')
        }
        //CANCEL SUBSCRIPTION
        const uSub = await subscriptionModel.findOneAndUpdate(
          { _id: sub._id },
          { subStatus: 'CANCELED_BY_ADMIN'},
          { new: true }
        ).session(session)
        const newMollieSub = await mollieClient.customers_subscriptions.cancel(
          sub.payement.mollieSubscriptionID,
          { customerId: sub.payement.mollieCustomerID, }
        )
        await session.commitTransaction()
        session.endSession()
        //SEND EMAIL
        var mail = await sendMail(FROM, sub.user.email, 'Aquadream - Abonnement annulé', CANCEL_SUBSCRIPTION_DISCOUNT(graphqlDiscount, sub))
        return true
      }catch(error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        return false
      }
    },

    cancelSubscriptionWithRefund: async(parent, { id }, { models: { subscriptionModel }}, info) => {
      //GET SUBSCRIPTION && PAYMENT DATA
      //REFUND EVERY PAYMENT LINKED TO THIS SUBSCRIPTION
      //CANCEL MOLLIE SUBSCRIPTION
      //SEND EMAIL
    }


  },
  Subscription: {
    payement: async({ payement }, args, { models: { payementModel }}, info) => {
      if(payement === undefined) return null
      const object = await payementModel.findById({ _id: payement }).exec()
      return object
    },

    user: async({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return null
      const object = await userModel.findById({ _id: user }).exec()
      return object
    },

    lessonsDay: async({ lessonsDay }, args, { models: { lessonDayModel }}, info) => {
      if(lessonsDay === undefined) return null
      var lessonsDayList = []
      lessonsDay.forEach(element => {
        var object = lessonDayModel.findById({ _id: element }).exec()
        lessonsDayList.push(object)
      });
      return  lessonsDayList
    },

    lessons: async({ lessons }, args, { models: { lessonModel }}, info) => {
      if(lessons == undefined) return null
      var lessonsList = []
      lessons.forEach(element => {
        var object = lessonModel.findById({ _id: element }).exec()
        lessonsList.push(object)
      });
      return lessonsList
    }
  }
}