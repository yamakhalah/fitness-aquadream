const { LESSON_DAY, LESSON, TEACHER, USER } = require('./dbName')
const { ApolloError } = require('apollo-server')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LessonDaySchema = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: LESSON,
    default: null
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: TEACHER,
    required: true
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: USER,
    require: true,
    default: [],
  }],
  dayDate: { type: String, required: true },
  hour: {
    begin: { type: String, required: true },
    end: { type: String, required: true}
  },
  spotCanceled: { type: Number, required: true, min: 0, default: 0 },
  spotLeft: { type: Number, required: true, min: 0 },
  spotTotal: { type: Number, required: true, min: 1 },
  isCanceled: { type: Boolean, required: true, default: false}
})

LessonDaySchema.statics.updateLessonDay = function(id, lesson, session) {
  if(session) {
    return LessonDay.findOneAndUpdate({'_id': id}, lesson, { new: true }).session(session)
  }else{
    return LessonDay.findOneAndUpdate({'_id': id}, lesson, { new: true })
  }
}

LessonDaySchema.statics.deleteLessonDay = function(id) {
  return LessonDay.findOneAndDelete({'_id': id})
}

LessonDaySchema.statics.create = function(data, opts) {
  const lessonDay = new LessonDay({ teacher: data.teacher, dayDate: data.dayDate, hour: data.hour, spotLeft: data.spotLeft, spotTotal: data.spotTotal })
  return lessonDay.save(opts)
}

LessonDaySchema.statics.decreaseSpotLeft = function(id) {
  return LessonDay.findOneAndUpdate(
    { _id: id },
    { $inc: { spotLeft: -1 }},
    { new: true }
  )
}

LessonDaySchema.statics.increaseSpotLeft = function(id) {
  return LessonDay.findOneAndUpdate(
    { _id: id },
    { $inc: { spotLeft: 1 }},
    { new: true }
  )
}

LessonDaySchema.statics.decreaseSpotCanceled = function(id) {
  return LessonDay.findOneAndUpdate(
    { _id: id },
    { $inc: { spotCanceled: -1 }},
    { new: true }
  )
}

LessonDaySchema.statics.increaseSpotCanceled = function(id) {
  return LessonDay.findOneAndUpdate(
    { _id: id },
    { $inc: { spotCanceled: 1 }},
    { new: true }
  )
}

LessonDaySchema.statics.addUserDecreaseSpotLeft = function(id, user, opts) {

  return LessonDay.findById(id).then(lesson => {
    lesson.users.push(user)
    return LessonDay.findOneAndUpdate({'_id': lesson._id}, {users: lesson.users, $inc: { spotLeft: -1 }}, { new: true, session: opts.session})
  })
}

LessonDaySchema.statics.removeUserIncreaseSpotLeft = function(id, user, opts) {
  return LessonDay.findById(id).then(lesson => {
    var index = lesson.users.indexOf(user)
    lesson.users.splice(index, 1)
    if(index === -1) return null
    return LessonDay.findOneAndUpdate(
      {_id: lesson._id },
      { users: lesson.users, $inc: { spotLeft: 1 }},
      { new: true, session: opts.session }
    )
  })
}

LessonDaySchema.statics.addUserDecreaseSpotCanceled = function(id, user) {

  return LessonDay.findById(id).then(lesson => {
    lesson.users.push(user)
    return LessonDay.findOneAndUpdate({'_id': lesson.id}, {users: lesson.users, $inc: { spotCanceled: -1 }}, { new: true})
  })
}

LessonDaySchema.statics.removeUserIncreaseSpotCanceled = function(id, user, opts) {
  return LessonDay.findById(id).then(lesson => {
    var index = lesson.users.indexOf(user)
    if(index === -1) throw new ApolloError('Index = -1')
    lesson.users.splice(index, 1)
    return LessonDay.findOneAndUpdate(
      {_id: lesson._id },
      { users: lesson.users, $inc: { spotCanceled: 1 }},
      { new: true, session: opts.session }
    )
  })
}

LessonDaySchema.statics.addLesson = function(id, lesson, opts) {
  return LessonDay.findOneAndUpdate({_id: id}, {lesson: lesson}, opts)
}

const LessonDay = mongoose.model(LESSON_DAY, LessonDaySchema)

export default LessonDay