import subscriptionModel from '../models/subscription'
import payementModel from '../models/payement'
import lessonModel from '../models/lesson'
import lessonDayModel from '../models/lessonDay'
import userModel from '../models/user'
import mongoose from 'mongoose'
import { ApolloError} from 'apollo-server-express'
import { sendMail, FROM, CHANGE_SUBSCRIPTION } from '../mailer'

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

    cancelSubscriptionWithDiscount: async(parent, { id }, { models: { subscriptionModel }}, info) => {
      //GET SUBSCRIPTION && PAYMENT DATA
      //COMPUTE HOW MUCH CUSTOMER ALREADY PAID BASED ON RECURENCE BEGIN AND TOTAL MONTHLY
      //GENERATE DISCOUNT FOR AMOUNT PAID
      //CANCEL MOLLIE SUBSCRIPTION
      //SEND EMAIL
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
      if(payement === null) return null
      const object = await payementModel.findById({ _id: payement }).exec()
      return object
    },

    user: async({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return null
      const object = await userModel.findById({ _id: user }).exec()
      return object
    },

    lessonsDay: async({ lessonsDay }, args, { models: { lessonDayModel }}, info) => {
      if(lessonsDay == null) return null
      var lessonsDayList = []
      lessonsDay.forEach(element => {
        var object = lessonDayModel.findById({ _id: element }).exec()
        lessonsDayList.push(object)
      });
      return  lessonsDayList
    },

    lessons: async({ lessons }, args, { models: { lessonModel }}, info) => {
      if(lessons == null) return null
      var lessonsList = []
      lessons.forEach(element => {
        var object = lessonModel.findById({ _id: element }).exec()
        lessonsList.push(object)
      });
      return lessonsList
    }
  }
}