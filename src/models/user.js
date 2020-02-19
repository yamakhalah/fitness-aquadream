const { USER, CREDIT, SUBSCRIPTION, DISCOUNT, LESSON_DAY } = require( './dbName');
const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('dotenv').config()

import bcrypt from 'bcrypt'

const UserSchema = new Schema({
  mollieCustomerID: {
    type: String,
    default: ""
  },
  subscriptions: [{
    type: Schema.Types.ObjectId,
    ref: SUBSCRIPTION,
    default: []
  }],
  credits: [{
    type: Schema.Types.ObjectId,
    ref: CREDIT,
    default: []
  }],
  discounts: [{
    type: Schema.Types.ObjectId,
    ref: DISCOUNT,
    default: []
  }],
  activeLessonsDay: [{
    type: Schema.Types.ObjectId,
    ref: LESSON_DAY,
    default: []
  }],
  email: { 
    type: String,
    unique: true
  },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isTeacher: { type: Boolean, default: false },
  paidYearlyTax: { type: Boolean, default: false }
})

UserSchema.statics.updateUser = function(id, user) {
  return User.findOneAndUpdate({_id: id}, user, {new: true})
}

UserSchema.statics.deleteUser = function(id) {
  return User.findOneAndDelete({_id: id})
}

UserSchema.statics.findSubscriptions = function(id) {
  return User.findById(id).populate(SUBSCRIPTION).then(user => user.subscriptions)
}

UserSchema.statics.findCredits = function(id) {
  return User.findById(id).populate(CREDIT).then(user => user.credits)
}

UserSchema.statics.findDiscounts = function(id) {
  return User.findById(id).populate(DISCOUNT).then(user => user.discounts)
}

UserSchema.statics.findActiveLessonsDay = function(id) {
  return User.findById(id).populate(LESSON_DAY).then(user => user.activeLessonsDay)
}

UserSchema.statics.addCredit = function(id, credit, opts) {
  return User.findById(id).then(user => {
    user.credits.push(credit)
    return User.findOneAndUpdate({ _id: user._id }, { credits: user.credits }, { new: true, session: opts.session })
  })
}

UserSchema.statics.removeCredit = function(id, credit) {
  return User.findById(id).then(user => {
    return User.findOneAndUpdate(
      { id: user._id },
      { $pull: { credits: credit }},
      { new: true }
    )
  })
}

UserSchema.statics.addSubscription = function(id, subscription, opts) {
  return User.findById(id).then(user => {
    user.subscriptions.push(subscription)
    return User.findOneAndUpdate(
      { id: user._id },
      { subscriptions: user.subscriptions },
      { new: true , opts }
    )
  })
}

UserSchema.statics.addActiveLessonDay = function(id, lessonDay) {
  return User.findById(id).then(user => {
    user.activeLessonsDay.push(lessonDay)
    return User.findOneAndUpdate({ _id: user._id }, { activeLessonsDay: user.activeLessonsDay }, { new: true })
  })
}

UserSchema.statics.removeActiveLessonDay = function(id, lessonDay) {
  return User.findById(id).then(user => {
    return User.findOneAndUpdate({ _id: user._id }, { $pull: { activeLessonsDay: lessonDay }}, { new: true })
  })
}

UserSchema.statics.create = function(data) {
  const hashedPassword = bcrypt.hashSync(data.password, process.env.SALT)
  const user = new User({ email: data.email , password: hashedPassword, firstName: data.firstName, lastName: data.lastName, phone: data.phone, gender: data.gender, isAdmin: false, isTeacher: false })
  return user.save()
}

UserSchema.pre('save', function() {
  console.log('PRE SAVE')
})



const User = mongoose.model(USER, UserSchema)

export default User