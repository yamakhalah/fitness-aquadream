import lessonSubTypeModel from '../models/lessonSubType'

export default {
  Query: {
    lessonSubType: async (parent, { id }, { models: { lessonSubTypeModel }}, info) => {
      const lessonSubType = await lessonSubTypeModel.findById({ _id: id }).exec()
      return lessonSubType
    },

    lessonsSubType: async(parent, args, { models: { lessonSubTypeModel }}, info) => {
      const lessonsSubType = await lessonSubTypeModel.find().exec()
      return lessonsSubType
    }
  },

  Mutation: {
    createLessonSubType: async(parent, { name, simpleName }, { models: { lessonSubTypeModel }}, info) => {
      const lessonSubType = await lessonSubTypeModel.create({ name, simpleName })
      return lessonSubType
    },

    deleteLessonSubType: async(parent, { id }, { models: { lessonSubTypeModel }}, info) => {
      const lessonSubType = await lessonSubTypeModel.deleteLessonSubType(id)
      return lessonSubType
    }
  },

  LessonSubType: {

  }
}