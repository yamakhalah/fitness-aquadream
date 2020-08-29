require('dotenv').config()
import { createMollieClient } from '@mollie/api-client'
import { sendMail, FROM, CONFIRM_SUBSCRIPTION } from '../mailer'
import mongoose from 'mongoose'
import discountModel from '../models/discount'
import payementModel from '../models/payement'
import subscriptionModel from '../models/subscription'
import userModel from '../models/user.js'
import lessonModel from '../models/lesson'
import lessonDayModel from '../models/lessonDay'
import moment from 'moment'
const express = require('express')
const uuid = require('uuid')
const router = express.Router()
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY })

moment.locale('fr')

const confirmAdminSubscription = async (payment) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  const opts = { session }
  var subscription = null
  try {
    if(payment.status === 'paid' && payment.amountRefunded.value === '0.00') {
      subscription = await mollieClient.customers_subscriptions.create({
        customerId: payment.customerId,
        amount: {
          currency: 'EUR',
          value: String(payment.metadata.totalMonthly)+'.00'
        },
        times: payment.metadata.subDuration-1,
        interval: '1 month',
        startDate: payment.metadata.startDate,
        //interval: '1 day',
        //startDate: moment().format('YYYY-MM-DD'),
        description: payment.id,
        mandateId: payment.mandateId,
        webhookUrl: process.env.MOLLIE_WEBHOOK_SUBSCRIPTION_URL
      })

      const mandate = await mollieClient.customers_mandates.get(
        subscription.mandateId,
        { customerId: subscription.customerId }
      ) 
      //UPDATE PAYEMENT TO DB
      const graphqlPayment = await payementModel.create(
        { molliePaymentID: payment.id,
          mollieCustomerID: payment.customerId,
          mollieSubscriptionID: subscription.id,
          mollieMandateID: mandate.id,
          mollieMandateStatus: mandate.status,
          reference: payment.metadata.reference, 
          subscription: payment.metadata.subscription
        },
        opts
      )

        //UPDATE SUBSCRIPTION SUBSTATUS and PaymentID
      const graphqlSubscription = await subscriptionModel.findOneAndUpdate(
        { _id: graphqlPayment.subscription },
        {
          payement: graphqlPayment._id,
          subStatus: 'WAITING_BEGIN'
        },
        { new: true }
      ).session(session)

      const user = await userModel.addSubscription(payment.metadata.userID, graphqlSubscription._id, opts)
      await session.commitTransaction()
      session.endSession()
      var mail = await sendMail(FROM, user.email, 'Aquadream - Confirmation de votre abonnement', CONFIRM_SUBSCRIPTION(user))

    }else if(payment.status === 'paid' && payment.amount.value === payment.amountRefunded.value){
      await session.abortTransaction()
      session.endSession()
      return true
    }else{
      await session.abortTransaction()
      session.endSession()
      return true
    }
  }catch(error){
    try{
      console.log('CATCH ERROR')
      console.log(error)
      await session.abortTransaction()
      session.endSession()
      //const dPayment = await mollieClient.payments.cancel(paymentID)
      const dSubscription = await mollieClient.customers_subscriptions.cancel(subscription.id, { customerId: payment.customerId })
      return true
    }catch(errorBis) {
      console.log('CATCH ERROR BIS')
      console.log(errorBis)
      return true
    }
  }
}

const createSubscription = async (payment) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  const opts = { session }
  var subscription = null
  try {
    if(payment.status === 'paid' && payment.amountRefunded.value === '0.00') {
      subscription = await mollieClient.customers_subscriptions.create({
        customerId: payment.customerId,
        amount: {
          currency: 'EUR',
          value: String(payment.metadata.totalMonthly)+'.00'
        },
        times: payment.metadata.subDuration-1,
        interval: '1 month',
        startDate: payment.metadata.startDate,
        //interval: '1 day',
        //startDate: moment().format('YYYY-MM-DD'),
        description: payment.id,
        mandateId: payment.mandateId,
        webhookUrl: process.env.MOLLIE_WEBHOOK_SUBSCRIPTION_URL
      })

      const mandate = await mollieClient.customers_mandates.get(
        subscription.mandateId,
        { customerId: subscription.customerId }
      ) 
      //SET PAYMENT
      const dataPayment = {
        mollieCustomerID: payment.customerId,
        mollieSubscriptionID: subscription.id,
        molliePaymentID: payment.id,
        mollieMandateID: mandate.id,
        mollieMandateStatus: mandate.status,
        reference: payment.metadata.reference
      }
      //ADD PAYEMENT TO DB
      const graphqlPayement = await payementModel.create(dataPayment, opts)
      //SET SUBSCRIPTION
      var lessonsID = []
      for(const lesson of payment.metadata.lessons){
        lessonsID.push(lesson.lessonID)
        var graphqlLesson = await lessonModel.addUser(lesson.lessonID, payment.metadata.userID, opts)
        for(const lessonDay of graphqlLesson.lessonsDay) {
          var graphqlLessonDay = await lessonDayModel.addUserDecreaseSpotLeft(lessonDay, payment.metadata.userID, opts)
        }
      }
      for(const discount of payment.metadata.discounts) {
        const graphqlDiscount = await discountModel.findOneAndUpdate(
          { _id: discount.discountID },
          { status: 'USED' }
        ).session(session)
      }
      const validityBegin = moment(payment.metadata.startDate, 'YYYY-MM-DD')
      const validityEnd = moment(payment.metadata.endDate, 'YYYY-MM-DD')
      const dataSubscription = {
        payement: graphqlPayement.id,
        user: payment.metadata.userID,
        lessons: lessonsID,
        created: moment().toISOString(),
        subType: 'LESSON',
        subStatus: 'WAITING_BEGIN',
        total: payment.metadata.total,
        totalMonth: payment.metadata.totalMonthly,
        validityBegin: validityBegin.toISOString(),
        validityEnd: validityEnd.toISOString()
      }

      const graphqlSubscription = await subscriptionModel.createWithLessons(dataSubscription, opts)
      const updatedGraphqlPayement = await payementModel.findOneAndUpdate(
        { id: graphqlPayement.id },
        { subscription: graphqlSubscription.id },
        { new: true }
      ).session(session)
      var graphqlUser = {}
      if(payment.metadata.yearlyTax > 0) {
        graphqlUser = await userModel.findOneAndUpdate(
          { _id: payment.metadata.userID },
          { mollieCustomerID: payment.customerId, paidYearlyTax: true },
          { new: true }
        ).session(session)
      }
      const user = await userModel.addSubscription(payment.metadata.userID, graphqlSubscription._id, opts)
      await session.commitTransaction()
      session.endSession()
      var mail = await sendMail(FROM, user.email, 'Aquadream - Confirmation de votre abonnement', CONFIRM_SUBSCRIPTION(user))
      return true
    }else if(payment.status === 'paid' && payment.amount.value === payment.amountRefunded.value){
      await session.abortTransaction()
      session.endSession()
      return true
    }else{
      await session.abortTransaction()
      session.endSession()
      return true
    }
  }catch(error){
    try{
      console.log('CATCH ERROR')
      console.log(error)
      await session.abortTransaction()
      session.endSession()
      //const dPayment = await mollieClient.payments.cancel(paymentID)
      const dSubscription = await mollieClient.customers_subscriptions.cancel(subscription.id, { customerId: payment.customerId })
      return true
    }catch(errorBis) {
      console.log('CATCH ERROR BIS')
      console.log(errorBis)
      return true
    }
  }
}

export async function checkout(req, res, next){
  const paymentID = req.body.id
  const payment = await mollieClient.payments.get(paymentID)
  var isAccepted = false
  if(payment.metadata.admin) {
    isAccepted = await confirmAdminSubscription(payment)
  }else {
    isAccepted = await createSubscription(payment)
  }
  if(isAccepted) {
    res.sendStatus(200)
  }else{
    res.sendStatus(200)
  }
}

export async function subscription(req, res, next){
  console.log('SUBSCRIPTION  WEBHOOK')
  //SEND PAYMENT ID everytime a payment is made. Check subsciptionID in payment
  console.log(req)
  res.sendStatus(200)
}
