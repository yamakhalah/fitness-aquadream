import cron from 'node-cron'
import moment from 'moment'
import mongoose from 'mongoose'
import lessonModel from './models/lesson'
import subscriptionModel from './models/subscription'

moment.locale('fr')

//CHECK SUBSCRIPTION STATUS
cron.schedule('5 0 */1 * * *', async () => {
  console.log('CRON TASK: Subscriptions BEGIN')
  const session = await mongoose.startSession()
  const opts = { session }
  session.startTransaction() 
  try{
    var today = moment().toISOString(true)
    const subscriptionsToGoing = await subscriptionModel.find({
      subStatus: 'WAITING_BEGIN',
      validityBegin: { $lte: today }
    }).session(session)

    const subscriptionsToExpired = await subscriptionModel.find({
      subStatus: 'ON_GOING',
      validityEnd: { $lte: today }
    }).session(session)

    for(const sub of subscriptionsToGoing){
      const subscription = await subscriptionModel.findOneAndUpdate(
        { _id: sub._id },
        { subStatus: 'ON_GOING' }
      ).session(session)
    }

    for(const sub of subscriptionsToExpired){
      const subscription = await subscriptionModel.findOneAndUpdate(
        { _id: sub._id },
        { subStatus: 'EXPIRED'}
      ).session(session)
    }
    await session.commitTransaction()
    session.endSession()
    console.log('CRON TASK: Subscriptions END')
  }catch(error){
    console.log(error)
    await session.abortTransaction()
    session.endSession()
  }
})

//CHECK LESSON DAY STATUS
cron.schedule('5 0 */1 * * *', async () => {
  console.log('CRON TASK: Lessons BEGIN')
  const session = await mongoose.startSession()
  const opts = { session }
  session.startTransaction() 
  try{
    var today = moment().toISOString()
    const lessonsToGoing = await lessonModel.find({
      status: 'WAITING_BEGIN',
      recurenceBegin: { $lte: today }
    }).session(session)
    const lessonsToExpired = await lessonModel.find({
      status: 'ON_GOING',
      recurenceEnd: { $lte: today }
    }).session(session)

    for(const les of lessonsToGoing){
      const lesson = await lessonModel.findOneAndUpdate(
        { _id: les._id },
        { status: 'ON_GOING' },
        { new: true }
      ).session(session)
    }
    for(const les of lessonsToExpired){
      const lesson = await lessonModel.findOneAndUpdate(
        { _id: les._id },
        { status: 'EXPIRED'}
      ).session(session)
    }
    await session.commitTransaction()
    session.endSession()
    console.log('CRON TASK: Lessons END')
  }catch(error){
    console.log(error)
    await session.abortTransaction()
    session.endSession()
  }
})