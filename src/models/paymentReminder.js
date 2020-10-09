const { PAYMENT_REMINDER, SUBSCRIPTION, USER} = require('./dbName')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaymentReminderSchema = new Schema ({
  user: { 
    type: Schema.Types.ObjectId,
    reference: USER,
  }, 
  subscription: { 
    type: Schema.Types.ObjectId,
    reference: SUBSCRIPTION,
  }, 
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: String, required: true },
  limitDate: { type: String, required: true },
  resolved: { type: Boolean, required: true, default: false }
})

PaymentReminderSchema.statics.create = function(data, session) {
  const paymentReminder = new PaymentReminder({ user: data.user, subscription: data.subscription, amount: data.amount, dueDate: data.dueDate, limitDate: data.limitDate })
  return paymentReminder.save(session)
}

PaymentReminderSchema.statics.updatePaymentReminder = function(id, data, session) {
  return PaymentReminder.findOneAndUpdate(
    { _id: id },
    data,
    { new: true }
  ).session(session)
}

PaymentReminderSchema.statics.deletePaymentReminder = function(id) {
  return PaymentReminder.findOneAndDelete({ _id: id })
}

const PaymentReminder = mongoose.model(PAYMENT_REMINDER, PaymentReminderSchema)

export default PaymentReminder