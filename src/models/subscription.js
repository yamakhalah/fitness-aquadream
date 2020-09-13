const { USER, PAYEMENT, LESSON_BUNDLE, LESSON, LESSON_DAY, SUBSCRIPTION } = require( './dbName');

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubscriptionSchema = new Schema({
  payement: {
    type: Schema.Types.ObjectId,
    ref: PAYEMENT,
  },
  user: { 
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  lessonsDay: [{
    type: Schema.Types.ObjectId,
    ref: LESSON_DAY
  }],
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: LESSON
  }],
  created: { type: String, required: true },
  subType: { type: String, required: true },
  subStatus: { type: String, required: true },
  total: { type: Number, required: true },
  totalMonth: { type: Number, required: true },
  validityBegin: { type: String, required: true },
  validityEnd: { type: String, required: true }
})

SubscriptionSchema.statics.createWithLessons = function(data, opts) {
  const subscription = new Subscription({ payement: data.payement, user: data.user, lessons: data.lessons, created: data.created, subType: data.subType, subStatus: data.subStatus, total: data.total, totalMonth: data.totalMonth, validityBegin: data.validityBegin, validityEnd: data.validityEnd })
  return subscription.save(opts)
},

SubscriptionSchema.statics.createWithLessonsDay = function(data){
  const subscription = new Subscription({ payement: data.payement, user: data.user, lessonsDay: data.lessonsDay, created: data.created, subType: data.subType, subStatus: data.subStatus, total: data.total, totalMonth: data.totalMonth, validityBegin: data.validityBegin, validityEnd: data.validityEnd })
  return subscription.save()
},

SubscriptionSchema.statics.updateSubscription = function(id, subscription) {
  return this.findOneAndUpdate({'_id': id}, subscription)
}

SubscriptionSchema.statics.deleteSubscription = function(id) {
  return this.findOneAndDelete({'_id': id})
}

SubscriptionSchema.statics.changeLesson = function(id, oldLesson, newLesson, opts) {
  return Subscription.findById(id).then(subscription => {
    var index = subscription.lessons.indexOf(oldLesson)
    subscription.lessons.splice(index, 1)
    subscription.lessons.push(newLesson)
    return Subscription.findOneAndUpdate(
      { _id: subscription._id },
      { lessons: subscription.lessons },
      { new: true, opts}
    )
  })
}

const Subscription = mongoose.model(SUBSCRIPTION, SubscriptionSchema)

export default Subscription