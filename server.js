import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import path from 'path'
//const { ApolloServer, AuthenticationError }  from  'apollo-server-express'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
const { graphiqlExoress, graphqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
import cors from 'cors'
import cronManager from './src/cronManager'
import { SESSION_EXPIRED } from './src/error'
import payementRouter from './src/routes/payement'
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
require('dotenv').config()

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const app = express()

const whitelist = ['http://localhost:3000', 'https://localhost:3000']

const corsOptions = {
  origin: function (origin, callback){
    console.log('ORIGIN: '+origin)
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
  if (req.header('x-forwarded-proto') !== 'https')
    res.redirect(`https://${req.header('host')}${req.url}`)
  else
    next()
})
app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: true }))
app.use('/booking', payementRouter)

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
  introspection: true,
  playground: true,
  engine: {
    debugPrintReports: true
  },
  formatError: error => {
    console.log(error)
    console.log(error.extensions.exception.stacktrace)
    return error
  },

  
  //mocks: true,
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
        }
      }
    }
  }
})

server.applyMiddleware({ app, path: '/graphql', cors: false}) 

if(process.env.NODE_ENV === "production") {
  console.log('ask client prod')
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}else{
  console.log('ask client')
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}


app.listen({ port: process.env.PORT }, () => {
  console.log(`🚀 Server ready on port ${process.env.PORT}`)
})

/*
app.listen(5000, () => {
  mongoose.connect('mongodb://yamakhalah:-Yamakhalah71470504@ds047948.mlab.com:47948/heroku_k0j2bxt6', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  console.log('En écoute sur le port 5000');
})
const app = require('./server');

app.listen(process.env.PORT || 4000, () => {
  console.log('En écoute sur le port 4000');
});
*/