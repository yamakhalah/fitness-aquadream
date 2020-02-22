import subscriptionModel from '../models/subscription'
import payementModel from '../models/payement'
import lessonModel from '../models/lesson'
import lessonDayModel from '../models/lessonDay'
import userModel from '../models/user'

export default {
  Query: {
    subscription: async (parent, { id }, { models: { subscriptionModel }}, info) => {
      const subscription = await subscriptionModel.findById({ _id: id}).exec()
      return subscription
    },

    subscriptions: async (parent, args, { models: { subscriptionModel }}, info) => {
      const graphqlSubscription = await subscriptionModel.find().exec()
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