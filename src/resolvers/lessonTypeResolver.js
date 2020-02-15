import lessonTypeModel from '../models/lessonType'

export default {
  Query: {
    lessonType: async (parent, { id }, { models: { lessonTypeModel }}, info) => {
      const lessonType = await lessonTypeModel.findById({ _id: id }).exec()
      return lessonType
    },

    lessonsType: async(parent, args, { models: { lessonTypeModel }}, info) => {
      const lessonsType = await lessonTypeModel.find().exec()
      return lessonsType
    }
  },

  Mutation: {
    createLessonType: async(parent, { name, simpleName, compatibilities }, { models: { lessonTypeModel }}, info) => {
      const lessonType = await lessonTypeModel.create({ name, simpleName, compatibilities })
      return lessonType
    },

    deleteLessonType: async(parent, { id }, { models: { lessonTypeModel }}, info) => {
      const lessonSubType = await lessonTypeModel.deleteLessonSubType(id)
      return lessonSubType
    }
  },

  LessonType: {
    compatibilities: async({ compatibilities }, args, { models: { lessonTypeModel }}, info) => {
      if(compatibilities === undefined) return null
      var compatibilitiesList = []
      compatibilities.forEach(element => {
        var object = lessonTypeModel.findById({ _id: element }).exec()
        compatibilitiesList.push(object)
      });
      return compatibilitiesList
    },
  }
}