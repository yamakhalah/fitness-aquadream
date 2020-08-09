const { PAYEMENT, SUBSCRIPTION } = require('./dbName')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PayementSchema = new Schema ({
  subscription: { 
    type: Schema.Types.ObjectId,
    reference: SUBSCRIPTION,
  }, 
  mollieCustomerID: { type: String },
  mollieSubscriptionID: { type: String },
  molliePaymentID: { type: String },
  mollieMandateID: { type: String },
  mollieMandateStatus: { type: String },
  reference: { type: String }
})

PayementSchema.statics.updatePayement = function(id, payement) {
  return Payement.findOneAndUpdate({_id: id}, payement)
}

PayementSchema.statics.deletePayement = function(id) {
  return Payement.findOneAndDelete({_id: id})
}

PayementSchema.statics.create = function(data, opts) {
  const payement = new Payement({ mollieCustomerID: data.mollieCustomerID, mollieSubscriptionID: data.mollieSubscriptionID, molliePaymentID: data.molliePaymentID, mollieMandateID: data.mollieMandateID, mollieMandateStatus: data.mollieMandateStatus, reference: data.reference, subscription: data.subscription })
  return payement.save(opts)
}

const Payement = mongoose.model(PAYEMENT, PayementSchema)

export default Payement