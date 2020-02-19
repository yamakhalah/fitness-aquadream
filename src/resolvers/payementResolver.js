require('dotenv').config()
import GraphQLJSON from 'graphql-type-json'
import payementModel from '../models/payement'
import subscriptionModel from '../models/subscription'
import userModel from '../models/user'
import lessonModel from '../models/lesson'
import uuid from 'uuid'
import Promise  from 'promise'
import moment from 'moment'
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
        const payment = await payementModel.find(
          { reference: paymentRef }
        )
        if(payment) {
          const mSubscription = await mollieClient.customers_subscriptions.get(
            payment.mollieSubscriptionID,
            { customerId: payment.mollieCustomerID}
          )
          return mSubscription
        }else{
          return {}
        }
      }catch(error){
        console.log(error)
      }
    },

    getSession: async (parent, { orderResume, preBookedLessons, user }, { models: { payementModel }}, info) => {
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
        //CREATE FIRST PAYEMENT
        const ref = uuid.v4()
        const lessonsID = []
        for(const lesson of orderResume.lessonsData){
          var elem = {
            lessonID: lesson.lesson.id,
            //lessonMonthlyPrice: lesson.lessonMonthlyPrice
          }
          lessonsID.push(elem)
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
            startDate: moment(orderResume.recurenceBegin).format('YYYY-MM-DD'),
            lessons: lessonsID,
            reference: ref
          },
          sequenceType: 'first',
          customerId: user.mollieCustomerID,
          restrictPaymentMethodsToCountry: 'BE'
        }) 
        var graphqlUser = {}
        if(orderResume.yearlyTax > 0) {
          graphqlUser = await userModel.findOneAndUpdate(
            { _id: user.id },
            { mollieCustomerID: user.mollieCustomerID, paidYearlyTax: true },
            { new: true }
          )
        } else{
          console.log('NO TAX TO PAY')
          graphqlUser = await userModel.findOneAndUpdate(
            { _id: user.id },
            { mollieCustomerID: user.mollieCustomerID },
            { new: true }
          )
        }
        for(const lesson of preBookedLessons) {
          const preBookedLesson = lessonModel.addUser(lesson.id, user.id, null)
        }
        return molliePayment
      }catch(error){
        console.log('error')
        console.log(error)
      }





      /*
      //CHARGEBEE IMPLEMENTATION
        const id = uuid.v4()
        var plan = {}
        var checkout = {}
        const planPromise = chargebee.plan.create({
          id: id,
          name: id,
          description: 'Abonnement Aquadream',
          price: orderResume.totalMonthly*100,
          currency_code: 'EUR',
          period: 1,
          period_unit: 'month',
          pricing_model: 'flat_fee',
          billing_cycles: orderResume.subDuration
        }).request()

        await planPromise.then((result, error) => {
          if(error) {
            console.log('ERROR PLAN')
            console.log(error)
            //throw exception
          }else{
            plan = result.plan
          }
        })

        const checkoutPromise = chargebee.hosted_page.checkout_new({
          subscription: {
            plan_id: plan.id
          },
          customer: {
            first_name: user.firstName,
            last_name:  user.lastName,
            email: user.email,
            phone: user.phone
          },
          card: {
            gateway_account_id: 'gw_16CPTfRqEQy1LDB'
          }
        }).request()

        await checkoutPromise.then((result, error) => {
          if(error) {
            //throw exception
            console.log('ERROR')
            console.log(error)
          }else{
            checkout = result.hosted_page
          }
        })
        console.log(checkout)
        
        return checkout

      */
      /*
      // STRIPE IMPLEMENTATION WILL BE DONE AFTER
      console.log(orderResume)
      const plans = []
      const productsIDForType = {
        "5e2dd8019507530031240dde":"Abonnement Aquadream Bébé",
        "5e2dd8099507530031240ddf":"Abonnement Aquadream Enfant",
        "5e2dd8129507530031240de0":"Abonnement Aquadream Adulte"
      }
      for(const element of orderResume.lessonsData) {
        const plan = await Stripe.plans.create({
          amount: element.lessonMonthlyPrice*100,
          currency: 'eur',
          interval: 'month',
          product: { name: productsIDForType[element.lesson.lessonType.id] }
        })
        plans.push({plan: plan.id})
      }

      const session = await Stripe.checkout.sessions.create({
        payment_method_types: ['sds'],
        subscription_data: {
          items: plans
        },
        customer_email: user.email,

        success_url: 'https://localhost:3000/booking/success',
        cancel_url: 'https://localhost:3000/booking/cancel'
      })
      return session
      */
    }
  },
  Mutation: {
    createPayement: async(parent, { mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference }, { models: { payementModel }}, info) => {
      const payement = await payementModel.create({ mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference })
      return payement
    },

    updatePayement: async(parent, { id, subscription, mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference }, { models: { payementModel }}, info) => {
      const payement = await payementModel.updatePayement(id, { subscription, mollieSubscriptionID, molliePaymentID, mollieMandateID, mollieMandateStatus, reference })
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