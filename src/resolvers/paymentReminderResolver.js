import paymentReminderModel from '../models/paymentReminder'
import userModel from '../models/user'
import subscriptionModel from '../models/subscription'
import mongoose from 'mongoose'
import moment from 'moment'
import { sendMail } from '../mailer'
import { ApolloError } from 'apollo-server'
import { createMollieClient } from '@mollie/api-client'
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY })

moment.locale('fr')

export default {
  Query: {
    paymentReminder: async(parent, { id }, { models: { paymentReminderModel }}, info) => {
      const paymentReminder = await paymentReminderModel.findById(id).exec()
      return paymentReminder
    },

    paymentsReminder: async(parent, args, { models: { paymentReminderModel }}, info) => {
      const paymentsReminder = await paymentReminderModel.find().exec()
      return paymentsReminder
    },

    getPaymentReminderSession: async(parent, { id }, { models: { paymentReminderModel }}, info) => {
      const paymentReminder = await paymentReminderModel.findById(id).populate([{ path: 'user', model: userModel }])
      const molliePayment = await mollieClient.payments.create({
        customerId: paymentReminder.user.mollieCustomerID,
        amount: { 
          currency: 'EUR',
          value: String(paymentReminder.amount)+'.00'
        },
        metadata: {
          paymentReminderID: id
        },
        description: 'Rappel de paiement '+paymentReminder.id,
        redirectUrl: process.env.MOLLIE_REMINDER_REDIRECT_URL+'/'+paymentReminder.id,
        webhookUrl: process.env.MOLLIE_WEBHOOK_REMINDER
      })
      return molliePayment
    },
  },
  Mutation: {
    
  },
  PaymentReminder: {
    user: async({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return {}
      const object = await userModel.findById({ _id: user }).exec()
      return object
    },

    subscription: async({ subscription }, args, { models: { subscriptionModel }}, info) => {
      if(subscription === undefined) return null
      const object = await subscriptionModel.findById({ _id: subscription}).exec()
      return object
    }
  }
}