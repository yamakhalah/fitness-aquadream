const { PAYEMENT, SUBSCRIPTION } = require('./dbName')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PayementSchema = new Schema ({
  subscription: { 
    type: Schema.Types.ObjectId,
    reference: SUBSCRIPTION,
  }, 
  mollieCustomerID: { type: String, required: true },
  mollieSubscriptionID: { type: String, required: true },
  molliePaymentID: { type: String, required: true },
  mollieMandateID: { type: String, required: true },
  mollieMandatestatus: { type: String, required: true },
  reference: { type: String, required: true }
})

PayementSchema.statics.updatePayement = function(id, payement) {
  return Payement.findOneAndUpdate({_id: id}, payement)
}

PayementSchema.statics.deletePayement = function(id) {
  return Payement.findOneAndDelete({_id: id})
}

PayementSchema.statics.create = function(data, opts) {
  const payement = new Payement({ mollieCustomerID: data.mollieCustomerID, mollieSubscriptionID: data.mollieSubscriptionID, molliePaymentID: data.molliePaymentID, mollieMandateID: data.mollieMandateID, mollieMandatestatus: data.mollieMandatestatus, reference: data.reference })
  return payement.save(opts)
}

const Payement = mongoose.model(PAYEMENT, PayementSchema)

export default Payement