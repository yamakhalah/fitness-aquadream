import teacherModel from '../models/teacher'
import userModel from '../models/user'

export default {
  Query: {
    teacher: async (parent, { id }, { models: { teacherModel }}, info) => {
      const teacher = await teacherModel.findById({ _id: id}).exec()
      return teacher
    },

    teachers: async (parent, args, { models: { teacherModel }}, info) => {
      const teachers = await teacherModel.find().exec()
      return teachers
    },
  },
  Mutation: {
    createTeacher: async(parent, { user }, { models: { teacherModel }}, info) => {
      const teacher = await teacherModel.create({ user })
      return teacher
    },

    updateTeacher: async(parent, { id, user, lessons_day }, { models: { teacherModel }}, info) => {
      const teacher = await teacherModel.updatePayement(id, { user, lessons_day })
      return teacher
    },

    deleteTeacher: async(parent, { id }, { models: { teacherModel }}, info) => {
      const teacher = await teacherModel.deletePayement(id)
      return teacher
    }
  },
  Teacher: {
    user: async ({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return null
      const object = await userModel.findById({ _id: user }).exec()
      return object
    }
  }
}