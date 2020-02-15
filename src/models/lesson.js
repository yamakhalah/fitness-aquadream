const { USER, LESSON_DAY, ADDRESS, LESSON, LESSON_TYPE, LESSON_SUB_TYPE } = require( './dbName');

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LessonSchema = new Schema({
  users: [{
    type: Schema.Types.ObjectId,
    ref: USER,
    default: []
  }],
  lessonsDay: [{
    type: Schema.Types.ObjectId,
    ref: LESSON_DAY,
    required: true
  }],
  lessonType: [{
    type: Schema.Types.ObjectId,
    ref: LESSON_TYPE,
    required: true
  }],
  lessonSubType: [{
    type: Schema.Types.ObjectId,
    ref: LESSON_SUB_TYPE,
    required: true
  }],
  discount: { type: String, required: true },
  name: { type: String, required: true }, 
  comment: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  pricing: {
    unitPrice: { type: Number, required: true, min: 0},
    unitPrice2X: { type: Number, required: true, min: 0 },
    unitPrice3X: { type: Number, required: true, min: 0 },
    monthlyPrice: { type: Number, required: true, min: 0 },
    monthlyPrice2X: { type: Number, required: true, min: 0 },
    monthlyPrice3X: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    totalPrice2X: { type: Number, required: true, min: 0 },
    totalPrice3X: { type: Number, required: true, min: 0 },
  },
  totalLessons: { type: Number, required: true, min: 0},
  totalMonth: { type: Number, required: true, min: 0},
  classicDate: { type: String, required: true },
  priorityDate: { type: String, required: true }, 
  recurenceBegin: { type: String, required: true },
  recurenceEnd: { type: String, required: true },
  spotLeft: { type: Number, required: true, min: 0 },
  spotTotal: { type: Number, required: true, min: 1 },
  mainType: { type: String, required: true },
  dateType: { type: String, required: true },
  status: { type: String, required: true, default: 'WAITING_BEGIN'},
  isOpened: { type: Boolean, required: true}
})

LessonSchema.statics.create = function(data, opts) {
const lesson = new Lesson({ lessonsDay: data.lessonsDay, lessonType: data.lessonType, lessonSubType: data.lessonSubType, discount: data.discount, address: data.address, pricing: data.pricing, totalLessons: data.totalLessons, totalMonth: data.totalMonth, classicDate: data.classicDate, priorityDate: data.priorityDate, recurenceBegin: data.recurenceBegin, recurenceEnd: data.recurenceEnd, spotLeft: data.spotLeft, spotTotal: data.spotTotal, lessonType: data.lessonType, lessonSubType: data.lessonSubType, mainType: data.mainType, dateType: data.dateType, name: data.name, comment: data.comment, isOpened: data.isOpened })
return lesson.save(opts)
},

LessonSchema.statics.updateLesson = function(id, lesson, opts) {
  return Lesson.findOneAndUpdate({_id: id}, lesson, { new: true, session: opts.session })
}

LessonSchema.statics.deleteLesson = function(id) {
  return Lesson.findOneAndDelete({'_id': id})
}

LessonSchema.statics.decreaseSpotLeft = function(id) {
  return Lesson.findOneAndUpdate(
    { _id: id },
    { $inc: { spotLeft: -1 }}
  )
}

LessonSchema.statics.increaseSpotLeft = function(id) {
  return Lesson.findOneAndUpdate(
    { _id: id },
    { $inc: { spotLeft: 1 }}
  )
}

LessonSchema.statics.addUser = function(id, user, opts) {
  const Lesson = mongoose.model(LESSON)

  return Lesson.findById(id).then(lesson => {
    lesson.users.push(user)
    return Lesson.findOneAndUpdate({'_id': lesson._id}, {users: lesson.users, $inc: { spotLeft: -1 }}, opts)
  })
}

LessonSchema.statics.removeUser = function(id, user) {
  return Lesson.findById(id).then(lesson => {
    return Lesson.findOneAndUpdate(
      {_id: lesson._id },
      { $pull: { users: user }, $inc: { spotLeft: 1 }},
      { new: true }
    )
  })
}

LessonSchema.statics.removeLessonDay = function(id, lessonDay) {
  return Lesson.findById(id).then(lesson => {
    return Lesson.findOneAndUpdate(
      {_id: lesson._id },
      { $pull: { lessonsDay: lessonDay }},
      { new: true }
    )
  })
}

const Lesson = mongoose.model(LESSON, LessonSchema)

export default Lesson