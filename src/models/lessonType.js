const { LESSON_TYPE } = require ('./dbName.js')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LessonTypeSchema = new Schema({
  name: { type: String, required: true },
  simpleName: { type: String, required: true },
  compatibilities : [{
    type: Schema.Types.ObjectId,
    ref: LESSON_TYPE
  }]
})

LessonTypeSchema.statics.create = function(data) {
  const lessonType = new LessonType({ name: data.name, simpleName: data.name, compatibilities: data.compatibilities })
  return lessonType.save()
}

LessonTypeSchema.statics.delete = function(id) {
  return LessonType.findOneAndDelete({ '_id': id })
}

const LessonType = mongoose.model(LESSON_TYPE, LessonTypeSchema)

export default LessonType