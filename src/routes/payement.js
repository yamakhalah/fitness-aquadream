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
  var subscription = null
  try {
    const payment = await mollieClient.payments.get(paymentID)
    if(payment.status === 'paid' && payment.amountRefunded.value === '0.00') {
      subscription = await mollieClient.customers_subscriptions.create({
        customerId: payment.customerId,
        amount: {
          currency: 'EUR',
          //value: String(payment.metadata.totalMonthly)+'.00'
          value: '1.00'
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
      const validityBegin = moment(payment.metadata.startDate, 'YYYY-MM-DD')
      const validityEnd = validityBegin.clone().add(payment.metadata.subDuration, 'M')
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
      const user = await userModel.addSubscription(payment.metadata.userID, graphqlSubscription._id, opts)
      await session.commitTransaction()
      session.endSession()
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
    console.log(error)
    await session.abortTransaction()
    session.endSession()
    const dPayment = await mollieClient.payments.cancel(paymentID)
    const dSubscription = await mollieClient.customers_subscriptions.cancel(subscription.id, { customerId: payement.customerId })
    return true
  }
}

export async function checkout(req, res, next){
  const isAccepted = await createSubscription(req.body)
  if(isAccepted) {
    res.sendStatus(200)
  }else{
    res.sendStatus(402)
  }
}

export async function subscription(req, res, next){
  res.sendStatus(200)
}
