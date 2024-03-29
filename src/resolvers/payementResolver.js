require('dotenv').config()
import GraphQLJSON from 'graphql-type-json'
import payementModel from '../models/payement'
import subscriptionModel from '../models/subscription'
import userModel from '../models/user'
import lessonModel from '../models/lesson'
import uuid from 'uuid'
import Promise  from 'promise'
import moment from 'moment'
import { ApolloError } from 'apollo-server'
import { createMollieClient } from '@mollie/api-client'
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY })
moment.locale('fr')

export default {
  Query: {
    payement: async (parent, { id }, { models: { payementModel }}, info) => {
      const payement = await payementModel.findById({ _id: id}).exec()
      return payement
    },

    payements: async (parent, args, { models: { payementModel }}, info) => {
      const payements = await payementModel.find().exec()
      return payements
    },

    getMollieCheckoutResult: async (parent, { paymentRef }, { models: { payementModel }}, info) => {
      try {
        const payment = await payementModel.findOne(
          { reference: paymentRef }
        )
        if(payment) {
          const mSubscription = await mollieClient.customers_subscriptions.get(payment.mollieSubscriptionID, { customerId: payment.mollieCustomerID})
          return mSubscription
        }else{
          return {}
        }
      }catch(error){
        console.log(error)
      }
    },
    /*
    doNotCallAGAIN: async(parent, args, { models: { payementModel } }, info) => {
      try {
        const list = await payementModel.find({})
        for(const payement of list) {
          console.log(payement.mollieSubscriptionID)
          const sub = await mollieClient.customers_subscriptions.update(payement.mollieSubscriptionID, {
            customerId: payement.mollieCustomerID,
            startDate: '2020-06-08'
          })
          console.log(sub)
        }
        return true
      }catch(error){
        console.log(error)
        return false
      }
    },
    */
    getPrioritySession: async (parent, { user, subscription }, { models: { userModel, payementModel }}, info) => {
      try{
        //CHECK IF USER HAS MOLLIE CUSTOMER ID
        if(user.mollieCustomerID.length === 0){
          //IF NO CUSTOMER CREATE THE CUSTOMER
          const mollieUser = await mollieClient.customers.create({
            name: user.firstName+' '+user.lastName,
            email: user.email,
            locale: 'fr_BE'
          })
          //console.log(mollieUser)
          user.mollieCustomerID = mollieUser.id
        }

        var startDate = moment(subscription.validityBegin)
        var today = moment()
        today.add(14, 'days')
        while(startDate.isSameOrBefore(today)) {
          startDate.add(1, 'months')
        }

        var graphqlUser = await userModel.findOneAndUpdate(
          { _id: user.id },
          { mollieCustomerID: user.mollieCustomerID },
          { new: true }
        )
        //CREATE FIRST PAYEMENT
        const ref = uuid.v4()
 
        const molliePayment = await mollieClient.payments.create({
          amount: {
            currency: 'EUR',
            value: String(subscription.totalMonth)+'.00'
          },
          description: 'Première échéance abonnement et taxe annuelle (si non payée)',
          redirectUrl: process.env.MOLLIE_REDIRECT_URL+'/'+ref,
          webhookUrl: process.env.MOLLIE_WEBHOOK_URL,
          locale: 'fr_BE',
          method: ['bancontact', 'creditcard', 'directdebit', 'inghomepay', 'belfius', 'banktransfer', 'mybank'],
          metadata: {
            userID: user.id,
            subDuration: Math.ceil(moment(subscription.validityEnd).diff(moment(subscription.validityBegin), 'months', true)),
            totalMonthly: subscription.totalMonth,
            total: subscription.total,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: moment(subscription.validityEnd).format('YYYY-MM-DD'),
            lessons: subscription.lessons,
            reference: ref,
            admin: true,
            subscription: subscription.id
          },
          sequenceType: 'first',
          customerId: user.mollieCustomerID,
          restrictPaymentMethodsToCountry: 'BE'
        }) 
        var graphqlUser = await userModel.findOneAndUpdate(
          { _id: user.id },
          { mollieCustomerID: user.mollieCustomerID },
          { new: true }
        )
        return molliePayment
      }catch(error){
        console.log('error')
        console.log(error)
      }
    },

    getSession: async (parent, { orderResume, preBookedLessons, user, admin }, { models: { payementModel, lessonModel }}, info) => {
      try{
        const lessonsID = []
        for(const lesson of orderResume.lessonsData){
          var tmp = await lessonModel.findById(lesson.lesson.id)
          if(tmp.spotLeft <= 0) return new ApolloError('LESSON_FULL')
          var elem = {
            lessonID: lesson.lesson.id,
            //lessonMonthlyPrice: lesson.lessonMonthlyPrice
          }
          lessonsID.push(elem)
        }
        //CHECK IF USER HAS MOLLIE CUSTOMER ID
        if(user.mollieCustomerID.length === 0){
          //IF NO CUSTOMER CREATE THE CUSTOMER
          const mollieUser = await mollieClient.customers.create({
            name: user.firstName+' '+user.lastName,
            email: user.email,
            locale: 'fr_BE'
          })
          //console.log(mollieUser)
          user.mollieCustomerID = mollieUser.id
        }
        //CREATE FIRST PAYEMENT
        const ref = uuid.v4()
        const discountsID = []
        for(const discount of orderResume.discounts){
          var elem = {
            discountID: discount.id
          }
          discountsID.push(elem)
        }

        var startDate = moment(orderResume.recurenceBegin)
        var today = moment()
        today.add(14, 'days')
        while(startDate.isSameOrBefore(today)) {
          startDate.add(1, 'months')
        }
        const molliePayment = await mollieClient.payments.create({
          amount: {
            currency: 'EUR',
            value: String(orderResume.totalMonthly+orderResume.yearlyTax)+'.00'
          },
          description: 'Première échéance abonnement et taxe annuelle (si non payée)',
          redirectUrl: process.env.MOLLIE_REDIRECT_URL+'/'+ref,
          webhookUrl: process.env.MOLLIE_WEBHOOK_URL,
          locale: 'fr_BE',
          method: ['bancontact', 'creditcard', 'directdebit', 'inghomepay', 'belfius', 'banktransfer', 'mybank'],
          metadata: {
            userID: user.id,
            subDuration: orderResume.subDuration,
            totalMonthly: orderResume.totalMonthly,
            total: orderResume.total,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: moment(orderResume.recurenceEnd).format('YYYY-MM-DD'),
            lessons: lessonsID,
            discounts: discountsID,
            reference: ref,
            yearlyTax: orderResume.yearlyTax,
            admin: admin
          },
          sequenceType: 'first',
          customerId: user.mollieCustomerID,
          restrictPaymentMethodsToCountry: 'BE'
        }) 
        var graphqlUser = await userModel.findOneAndUpdate(
          { _id: user.id },
          { mollieCustomerID: user.mollieCustomerID },
          { new: true }
        )
        for(const lesson of preBookedLessons) {
          const preBookedLesson = await lessonModel.addUser(lesson.id, user.id, null)
        }
        return molliePayment
      }catch(error){
        console.log('error')
        console.log(error)
      }
    },

    getMollieSubscriptionData: async (parent, { mollieCustomerID, mollieSubscriptionID }, { models: { payementModel }}, info) => {
      try{
        const mollieSubscription = await mollieClient.customers_subscriptions.get(
          mollieSubscriptionID,
          { customerId: mollieCustomerID }
        )
        return mollieSubscription
      }catch(error){
        //console.log(error)
        return {}
      }
    },

  },
  Mutation: {
    createPayement: async(parent, { mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference }, { models: { payementModel }}, info) => {
      const payement = await payementModel.create({ mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference })
      return payement
    },

    updatePayement: async(parent, { id, subscription, mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference }, { models: { payementModel }}, info) => {
      const payement = await payementModel.updatePayement(id, { subscription, mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference })
        .then(payement => {
          pubSub.publish(PAYEMENT_UPDATED, { payementUpdated: payement })
        })
      return payement
    },

    deletePayement: async(parent, { id }, { models: { payementModel }}, info) => {
      const payement = await payementModel.deletePayement(id)
      return payement
    },

    addSubscriptionToPayement: async(parent, {id, subscription }, { models: { payementModel }}, info) => {
      const payement = await payementModel.findOneAndUpdate(
        { _id: id },
        { subscription: subscription },
        { new: true}
      )
    },

    preSubscribeToLessons: async(parent, { preBookedLessons, user }, { models: { payementModel }}, info) => {
      try{
        for(const lesson of preBookedLessons) {
          const preBookedLesson = lessonModel.addUser(lesson.id, user.id, null)
        }
        return true
      }catch(error){
        console.log(error)
        return false
      }
    }
  },

  Payement: {
    subscription: async({ subscription }, args, { models: { subscriptionModel }}, info) => {
      if(subscription === undefined) return null
      const object = await subscriptionModel.findById({ _id: subscription}).exec()
      return object
    }
  },
  
  JSON: {
    __serialize(value) {
      console.log(value)
      return GraphQLJSON.parseValue(value)
    }
  }
}