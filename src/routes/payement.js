require('dotenv').config()
import { LESSON } from '../models/dbName'
import { createMollieClient } from '@mollie/api-client'
import { sendMail, FROM, CONFIRM_SUBSCRIPTION, PAYMENT_REMINDER } from '../mailer'
import mongoose from 'mongoose'
import discountModel from '../models/discount'
import payementModel from '../models/payement'
import subscriptionModel from '../models/subscription'
import paymentReminderModel from '../models/paymentReminder'
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
        description: 'Aquadream abonnement - '+payment.id,
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
        description: 'Aquadream abonnement - '+payment.id,
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
        reference: payment.metadata.reference,
      }
      //ADD PAYEMENT TO DB
      const graphqlPayement = await payementModel.create(dataPayment, opts)
      //SET SUBSCRIPTION
      var lessonsID = []
      var validityBegin = null
      for(const lesson of payment.metadata.lessons){
        lessonsID.push(lesson.lessonID)
        var graphqlLesson = await lessonModel.addUser(lesson.lessonID, payment.metadata.userID, opts)
        if(validityBegin === null || moment(graphqlLesson.recurenceBegin).isBefore(validityBegin)){
          validityBegin = moment(graphqlLesson.recurenceBegin, 'YYYY-MM-DD')
        }
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
        { _id: graphqlPayement.id },
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


export async function test(req, res, next) {
  res.sendStatus(200)
  return
  var weekToAdd = 5
  var beginDate = moment("26/10/2020_23:59", 'DD/MM/YYYY_HH:mm').toISOString()
  var subTypes = new Array('5e34545245fe1c003150fdf8', '5e3453f345fe1c003150fdf1','5e34542845fe1c003150fdf6')
  var lessonsDay = await lessonDayModel.find({
    'dayDate': { $gte: beginDate}
  }).populate(LESSON).exec()
  lessonsDay.forEach(lessonDay => {
    if(subTypes.toString().includes(lessonDay.lesson.lessonSubType[0].toString())) {
      var dayDate = moment(lessonDay.dayDate).add(5, 'week').toISOString(true)
      console.log(lessonDay.lesson.lessonSubType[0])
      console.log(lessonDay.dayDate)
      console.log(dayDate)
      var newLessonDay = lessonDayModel.findOneAndUpdate(
        { _id: lessonDay._id },
        { dayDate: dayDate}
      ).exec()
    }
  });
  res.sendStatus(200)
  return
}


export async function paymentReminderCheckout(req, res, next) {
  console.log('PAYMENT REMINDER WEBHOOK')
  const session = await mongoose.startSession()
  session.startTransaction()
  const paymentID = req.body.id
  const payment = await mollieClient.payments.get(paymentID)
  if(payment.status === 'paid') {
    var paymentReminder =  await paymentReminderModel.findById(payment.metadata.paymentReminderID)
    const graphqlPayement = await payementModel.findOne({
      mollieCustomerID: payment.customerId,
      subscription: paymentReminder.subscription
    })
    var mollieSubscription = await mollieClient.customers_subscriptions.get(
      graphqlPayement.mollieSubscriptionID,
      { customerId: graphqlPayement.mollieCustomerID }
    )
    try{
      //RESOLVE PAYMENT REMINDER
      paymentReminder = await paymentReminderModel.updatePaymentReminder(paymentReminder.id, {resolved: true}, session)
      //CHANGE SUBSCRIPTION STATUS
      const graphqlSubscription = await subscriptionModel.findOneAndUpdate(
        { _id: paymentReminder.subscription },
        { subStatus: 'ON_GOING' },
        { new: true }
      ).session(session)
      //DECREASE MOLLIE SUBSCRIPTION COUNTER
      if(paymentReminder.type === 'FAILED'){
        mollieSubscription = await mollieClient.customers_subscriptions.update(
          graphqlPayement.mollieSubscriptionID,
          { 
            customerId: graphqlPayement.mollieCustomerID ,
            times: mollieSubscription.times-1
          }
        )
      }
      await session.commitTransaction()
      session.endSession()
      res.sendStatus(200)
      return
    }catch(error){
      console.log('CATCH ERROR')
      console.log(error)
      await session.abortTransaction()
      session.endSession()
      /*
      mollieSubscription = mollieClient.customers_subscriptions.update(
        graphqlPayement.mollieSubscriptionID,
        { 
          customerId: graphqlPayement.mollieCustomerID ,
          times: mollieSubscription.times+1
        }
      )
      */
      res.sendStatus(469)
      return
    }
  }
  res.sendStatus(200)
}

export async function subscription(req, res, next){
  console.log('SUBSCRIPTION  WEBHOOK')
  const paymentID = req.body.id
  const payment = await mollieClient.payments.get(paymentID)
  if(payment.status === 'failed' || payment.details.bankReasonCode) {
    console.log('PAYMENT FAILED')
    console.log(payment)
    const session = await mongoose.startSession()
    session.startTransaction()
    try{
      var subscriptionID = payment.subscriptionId
      var customerID = payment.customerId
      var amount = Number(payment.amount.value)
      var dueDate = moment(payment.createdAt).toISOString(true)
      var limitDate = moment(payment.createdAt).add(2, 'week').toISOString(true)
      var graphqlUser = await userModel.findOne({
        mollieCustomerID: customerID
      })

      var graphqlPayement = await payementModel.findOne({
        mollieCustomerID: customerID,
        mollieSubscriptionID: subscriptionID
      })
      //CREER UN PaymentReminder
      var paymentReminder = null
      if(payment.details.bankReasonCode) {
        paymentReminder = await paymentReminderModel.create({
          user: graphqlUser.id,
          subscription: graphqlPayement.subscription,
          amount: amount,
          type: 'RETRO',
          dueDate: dueDate,
          limitDate: limitDate
        }, session)
      }else{
        paymentReminder = await paymentReminderModel.create({
          user: graphqlUser.id,
          subscription: graphqlPayement.subscription,
          amount: amount,
          type: 'FAILED',
          dueDate: dueDate,
          limitDate: limitDate
        }, session)
      }
      //create URL
      const paymentReminderURL = process.env.MOLLIE_PAYMENT_REMINDER_URL+'/'+paymentReminder.id
      //METTRE LA SUBSCRIPTION EN PENDING
      var graphqlSubscription = await subscriptionModel.updateSubscription(graphqlPayement.subscription, { subStatus: 'PAYMENT_REMINDER' }, session)
      //Envoyer un email au client l'invitant à payer
      var email = await sendMail(FROM, graphqlUser.email, 'URGENT: Aquadream - Echec du paiement de votre abonnement', PAYMENT_REMINDER(graphqlUser, paymentReminder, paymentReminderURL))
      console.log('PAYMENT REMINDER CREATED')
      await session.commitTransaction()
      session.endSession()
      res.sendStatus(200)
      return
    }catch(error) {
      console.log('PAYMENT REMINDER ERROR')
      console.log(error)
      await session.abortTransaction()
      session.endSession()
      res.sendStatus(469)
      return
    }
  }else{
    res.sendStatus(200)
    return
  }
}
