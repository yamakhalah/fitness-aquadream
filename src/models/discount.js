const { USER, DISCOUNT } = require('./dbName')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DiscountSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  discount: {
    type: Schema.Types.String,
    required: true
  },
  value: {
    type: Schema.Types.Number,
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

DiscountSchema.statics.create = function(data) {
  const discount = new Discount({ user: data.user, discount: data.discount, validityEnd: data.validityEnd })
  return discount.save()
}

const Discount = mongoose.model(DISCOUNT, DiscountSchema)

export default Discount