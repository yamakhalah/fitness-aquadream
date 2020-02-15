import userModel from '../models/user'
import errorLogModel from '../models/errorLog'
import mongoose from 'mongoose'

export default {
  Query: {
    errorLog: async (parent, { id }, { models: { errorLogModel }}, info) => {
      const errorLog = await errorLogModel.findById({ _id: id}).exec()
      return errorLog
    },

    errorLogs: async (parent, args, { models: { errorLogModel }}, info) => {
      const errorLogs = await errorLogModel.find().exec()
      return errorLogs
    },
  },
  Mutation: {
    test: async(parent, { user, code, message }, { models: { errorLogModel }}, info) => {
      //const session = await errorLogModel.startSession()
      const session = await mongoose.startSession()
      const opts = { session }
      session.startTransaction()
      try{
        await errorLogModel.create({ user: user, code: code, message: message }, opts)
        await errorLogModel.create({ user: user, code: code }, opts)
        console.log('commit')
        await session.commitTransaction()
        session.endSession()
        return true
      }catch(error) {
        console.log(error)
        console.log('abort')
        await session.abortTransaction()
        session.endSession()
        return false
      }finally{
        console.log('end')
      }
      const credit = await creditModel.create({ user, lessonDay, validityEnd })
      return credit
    },

    createErrorLog: async(parent, { user, code, message }, { models: { errorLogModel }}, info) => {
      const errorLog = await errorLogModel.create({ user: user, code: code, message: message })
      return errorLog
    },

    deleteErrorLog: async(parent, { id }, { models: { errorLogModel }}, info) => {
      const errorLog = await errorLogModel.deleteErrorLog(id)
      return errorLog
    }
  },
  ErrorLog: {
    user: async ({ user }, args, { models: { userModel }}, info) => {
      const object = await userModel.findById({ _id: user }).exec()
      return object
    }
  }
}