import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import path from 'path'
import kill from 'kill-port'
//const { ApolloServer, AuthenticationError }  from  'apollo-server-express'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
const { graphiqlExoress, graphqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
import cors from 'cors'
import cronManager from './src/cronManager'
import { SESSION_EXPIRED } from './src/error'
import { checkout, subscription, paymentReminderCheckout } from './src/routes/payement'
import schemas from './src/schemas'
import resolvers from './src/resolvers'
import userModel from './src/models/user'
import discountModel from './src/models/discount'
import payementModel from './src/models/payement'
import teacherModel from './src/models/teacher'
import lessonDayModel from './src/models/lessonDay'
import lessonModel from './src/models/lesson'
import creditModel from './src/models/credit'
import subscriptionModel from './src/models/subscription'
import errorLogModel from './src/models/errorLog'
import noShowDateModel from './src/models/noShowDate'
import lessonTypeModel from './src/models/lessonType'
import lessonSubTypeModel from './src/models/lessonSubType'
import paymentReminderModel from './src/models/paymentReminder'
require('dotenv').config()

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const app = express()

const whitelist = ['http://localhost:3000', 'https://localhost:3000', 'https://localhost:4000', 'http://localhost:4000', 'https://www.app.aquadream-temploux.be', 'https://app.aquadream-temploux.be', 'https://aquadream-test.herokuapp.com', 'https://www.aquadream-test.herokuapp.com']

const corsOptions = {
  origin: function (origin, callback){
    if(whitelist.indexOf(origin) !== -1 || !origin){
      callback(null, true)
    }else{
      callback(new Error('Nice try'))
    }
  },
  credentials: true
}
/*
const corsOptions = {
  origin: '*',
  credentials: true
}
*/
app.use((req, res, next) => {
  if(process.env.NODE_ENV === "production") {
    let host = req.headers.host;
    if (!host.match(/^www\..*/i)) {
      return res.redirect(301, "https://www." + host + req.url)
    } else if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.hostname + req.url)
    }
  }
  next()
})
app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: true }))

const getUser = async (req) => {
  var token = req.headers['authorization'];
  if (token) {
    try {
      return await jwt.verify(token, process.env.HASH);
    } catch (e) {
  
      if(e.name == 'TokenExpiredError') { return }
      else { throw new AuthenticationError(SESSION_EXPIRED);}
    }
  }
};

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers: resolvers,
  engine: {
    debugPrintReports: true
  },
  formatError: error => {
    console.log(error)
    console.log(error.extensions.exception.stacktrace)
    return error
  },
  context: async ({ req }) => {
    if (req) {
      const me = await getUser(req)
      return {
        me,
        models: {
          userModel,
          discountModel,
          payementModel,
          teacherModel, 
          lessonDayModel,
          lessonModel,
          lessonTypeModel,
          lessonSubTypeModel,
          creditModel,
          subscriptionModel,
          errorLogModel,
          noShowDateModel,
          paymentReminderModel,
        }
      }
    }
  }
})

server.applyMiddleware({ app, path: '/graphql', cors: false})

/*
const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)
*/

if(process.env.NODE_ENV === "production") {
  app.use(express.static('client/build'))

  app.post('/booking/subscription', subscription)
  app.post('/booking/checkout', checkout)
  app.post('/booking/paymentReminderCheckout', paymentReminderCheckout)

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}else{
  app.use(express.static('client/build'))

  app.post('/booking/subscription', subscription)
  app.post('/booking/checkout', checkout)
  app.post('/booking/paymentReminderCheckout', paymentReminderCheckout)
  //app.post('/booking/test', test)

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

app.listen({ port: process.env.PORT }, () => {
  console.log(`🚀 Server ready on port ${process.env.PORT}`)
})

process.on('SIGINT', function()  {
  console.log('Shutting Down From SIGINT')
  kill(process.env.PORT, 'tcp').then(process.exit(1)).error(console.log)
})
