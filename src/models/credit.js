const { USER, LESSON_DAY, CREDIT, SUBSCRIPTION } = require( './dbName');


const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CreditSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  lessonDay: {
    type: Schema.Types.ObjectId,
    ref: LESSON_DAY,
    required: true
  },
  isUsed: { type: Boolean, required: true, default: false},
  validityEnd: { type: String }
})

CreditSchema.statics.create = function(data) {
  const credit = new Credit({ user: data.user, lessonDay: data.lessonDay, validityEnd: data.validityEnd })
  return credit.save()
}

CreditSchema.statics.deleteCredit = function(id) {
  return Credit.findOneAndDelete({_id: id})
}

CreditSchema.statics.updateCredit =  function(id, credit) {
  return Credit.findOneAndUpdate({_id: id}, credit)
}

CreditSchema.statics.invalidateCredit = function(id) {
  return Credit.findOneAndUpdate(
    { _id: id},
    { isUsed: true },
    { new: true }
  )
}

const Credit = mongoose.model(CREDIT, CreditSchema)

export default Credit