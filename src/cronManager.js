import cron from 'node-cron'
import moment from 'moment'
import lessonModel from './models/lesson'
import subscriptionModel from './models/subscription'

moment.locale('fr')

//CHECK SUBSCRIPTION STATUS
cron.schedule('* * * * *', () => {
  console.log('running a task every minute')
})

//CHECK LESSON STATUS
cron.schedule('* * * * *', () => {
  console.log('running a task every minute')
})