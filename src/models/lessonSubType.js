const { LESSON_SUB_TYPE } = require('./dbName')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LessonSubTypeSchema = new Schema({
  name: { type: String, required: true },
  simpleName: { type: String, required: true }
})

LessonSubTypeSchema.statics.create = function(data) {
  const lessonSubType = new LessonSubType({ name: data.name, simpleName: data.simpleName })
  return lessonSubType.save()
}

LessonSubTypeSchema.statics.delete = function(id) {
  return lessonSubType.findOneAndDelete({ '_id': id })
}

const LessonSubType = mongoose.model(LESSON_SUB_TYPE, LessonSubTypeSchema)

export default LessonSubType