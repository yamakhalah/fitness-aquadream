const { USER, DISCOUNT, SUBSCRIPTION } = require('./dbName')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DiscountSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: SUBSCRIPTION,
  },
  discount: {
    type: Schema.Types.String,
    required: true
  },
  value: {
    type: Schema.Types.Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  validityEnd: {
    type: Date,
    required: true
  }
})

DiscountSchema.statics.updateDiscount = function(id, discount) {
  return Discount.findOneAndUpdate({_id: id}, discount)
}

DiscountSchema.statics.deleteDiscount = function(id) {
  return Discount.findOneAndDelete({_id: id})
}

DiscountSchema.statics.create = function(data, opts) {
  const discount = new Discount({ user: data.user, subscription: data.subscription, discount: data.discount, value: data.value, status: data.status, validityEnd: data.validityEnd })
  return discount.save(opts)
}

const Discount = mongoose.model(DISCOUNT, DiscountSchema)

export default Discount