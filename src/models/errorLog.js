const { ERROR_LOG } = require('./dbName')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ErrorLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user',  required: true },
  code: { type: String, required: true },
  message: { type: String, required: true }
})

ErrorLogSchema.statics.create = function(data, opts) {
  const errorLog = new ErrorLog({ user: data.user, code: data.code, message: data.message })
  return errorLog.save(opts)
}

ErrorLogSchema.statics.deleteErrorLog = function(id) {
  return ErrorLog.findOneAndDelete({ _id: id })
}

const ErrorLog = mongoose.model(ERROR_LOG, ErrorLogSchema)

export default ErrorLog