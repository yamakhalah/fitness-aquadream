const { LESSON_DAY, USER, TEACHER } = require( './dbName');

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeacherSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true,
    unique: true
  },
  lessons_day: [{
    type: Schema.Types.ObjectId,
    ref: LESSON_DAY,
    default: []

  }]
})

TeacherSchema.statics.updateTeacher = function(id, teacher) {
  return Teacher.findOneAndUpdate({'_id': id}, teacher)
}

TeacherSchema.statics.deleteTeacher = function(id) {
  return Teacher.findOneAndDelete({'_id': id})
}

TeacherSchema.statics.create = function(data) {
  const teacher = new Teacher({ user: data.user })
  return teacher.save()
}

TeacherSchema.statics.addLessonDay = function(id, lesson_day) {
  const Teacher = mongoose.model(TEACHER)

  return this.findById(id).then(teacher => {
    teacher.lessons_day_id.push(lesson_day)
    const updateTeacher = Teacher.findOneAndUpdate({'_id': teacher.id}, {lessons_day_id: teacher.lessons_day})
    return Promise.all([updateTeacher])
      .then((teacher) => teacher)
  })
}

const Teacher = mongoose.model(TEACHER, TeacherSchema)

export default Teacher