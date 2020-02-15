require('dotenv').config()
import { createMollieClient } from '@mollie/api-client'
import mongoose from 'mongoose'
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

const createSubscription = async (data) => {
  const paymentID = data.id
  const session = await mongoose.startSession()
  session.startTransaction()
  const opts = { session }
  try {
    const payment = await mollieClient.payments.get(paymentID)
    console.log('PAYMENT')
    console.log(payment)
    if(payment.status === 'paid') {
      const subscription = await mollieClient.customers_subscriptions.create({
        customerId: payment.customerId,
        amount: {
          currency: 'EUR',
          value: String(payment.metadata.totalMonthly)+'.00'
        },
        times: payment.metadata.subDuration-1,
        interval: '1 month',
        startDate: payment.metadata.startDate,
        description: payment.id,
        mandateId: payment.mandateId,
        webhookUrl: process.env.MOLLIE_WEBHOOK_SUBSCRIPTION_URL
      })
      console.log('SUBSCRIPTION')
      console.log(subscription)

      const mandate = await mollieClient.customers_mandates.get(
        subscription.mandateId,
        { customerId: subscription.customerId }
      ) 
      console.log('MANDATE')
      console.log(mandate)
      //SET PAYMENT
      const dataPayment = {
        mollieSubscriptionID: subscription.id,
        molliePaymentID: payment.id,
        mollieMandateID: subscription.mandateId,
        mollieMandatestatus: mandate.status,
        reference: uuid.v4()
      }
      //ADD PAYEMENT TO DB
      const graphqlPayement = await payementModel.create(dataPayment, opts)
      console.log('GRAPHQL PAYEMENT')
      console.log(graphqlPayement)
      //SET SUBSCRIPTION
      var lessonsID = []
      for(const lesson of payment.metadata.lessons){
        lessonsID.push(lesson.lessonID)
        var graphqlLesson = await lessonModel.addUser(lesson.lessonID, payment.metadata.userID, opts)
        console.log('GRAPHQL LESSON')
        console.log(graphqlLesson)
        for(const lessonDay of graphqlLesson.lessonsDay) {
          var graphqlLessonDay = await lessonDayModel.addUserDecreaseSpotLeft(lessonDay, payment.metadata.userID, opts)
          console.log('GRAPHQL LESSON DAY')
          console.log(graphqlLesson)
        }
      }
      console.log(lessonsID)
      const validityBegin = moment(payment.metadata.startDate, 'YYYY-MM-DD')
      const validityEnd = validityBegin.clone().add(payment.metadata.subDuration, 'M')
      const dataSubscription = {
        payement: graphqlPayement.id,
        user: payment.metadata.userID,
        lessons: lessonsID,
        created: moment().toISOString(),
        subType: 'LESSON',
        subStatus: 'ON_GOING',
        total: payment.metadata.total,
        totalMonth: payment.metadata.totalMonthly,
        validityBegin: validityBegin.toISOString(),
        validityEnd: validityEnd.toISOString()
      }

      const graphqlSubscription = await subscriptionModel.createWithLessons(dataSubscription, opts)
      console.log('GRAPHQL SUBSCRIPTION')
      console.log(graphqlSubscription)

      const updatedGraphqlPayement = await payementModel.findOneAndUpdate(
        { id: graphqlPayement.id },
        { subscription: graphqlSubscription.id },
        { new: true }
      ).session(session)
      const user = await userModel.addSubscription(payment.metadata.userID, graphqlPayement.id, opts)

      await session.commitTransaction()
      session.endSession()
      return true
    }else{
      await session.abortTransaction()
      session.endSession()
      return false
    }
  }catch(error){
    console.log('ERROR')
    console.log(error)
    await session.abortTransaction()
    session.endSession()
    return false
  }
}

router.post('/checkout', async (req, res, next) => {
  console.log('passage router')
  const isAccepted = await createSubscription(req.body)
  console.log(isAccepted)
  if(isAccepted) {
    res.sendStatus(200)
  }else{
    res.sendStatus(400)
  }
})

router.post('/subscription', async (req, res, next) => {
  console.log('passage subscription')
  console.log(req.body)
  res.sendStatus(200)
})

module.exports = router