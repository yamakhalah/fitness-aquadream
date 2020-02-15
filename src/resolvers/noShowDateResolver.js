import noShowDateModel from '../models/noShowDate'

export default {
  Query: {
    noShowDate: async (parent, { id }, { models: { noShowDateModel }}, info) => {
      const noShowDate = await noShowDateModel.findById({ _id:id }).exec()
      return noShowDate
    },

    noShowDatesFor: async (parent, { year }, { models: { noShowDateModel }}, info) => {
      const noShowDates = await noShowDateModel.find({ year: year }).exec()
      return noShowDates
    },

    noShowDates: async (parent, args, { models: { noShowDateModel }}, info) => {
      const noShowDates = await noShowDateModel.find().exec()
      return noShowDates
    }
  },
  Mutation: {
    createNoShowDate: async(parent, { begin, end, year }, { models: { noShowDateModel }}, info) => {
      const noShowDate = await noShowDateModel.create({ begin, end, year })
      return noShowDate
    },

    deleteNoShowDate: async(parent, { id }, { models: { noShowDateModel }}, info) => {
      const noShowDate = await noShowDateModel.deleteNoShowDate(id)
      return noShowDate
    }
  }
}