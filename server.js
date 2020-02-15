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
//require('dotenv').config()
console.log(process.env.NODE_ENV)

/*
const schema = makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers,
})
*/

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const app = express()

/*
const whitelist = ['http://aquadream.herokuapp.com', 'https://aquadream.herokuapp.com', 'http://localhost:3000', 'https://localhost:3000', 'https://aquadream-temploux.be', 'https://aquadream-temploux.be', 'https://app.aquadream-temploux.be', 'https://app.aquadream-temploux.be', 'www.app.aquadream.temploux.be']

const corsOptions = {
  origin:function (origin, callback){
    console.log('origin: ' +origin)
    if(whitelist.indexOf(origin) !== -1){
      callback(null, true)
    }else {
      callback(null, false)
    }
  },
  credentials: true
};
*/

const corsOptions = {
  origin: 'aquadream.herokuapp.com',
  credentials: true
}

app.use(cors(corsOptions))



app.use((req, res, next) => {
  console.log('HEADER')
  console.log(req.headers.origin)
  console.log(req.headers.host)
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
//A CHANGER
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
  introspection: false,
  playground: false,
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