import discountModel from '../models/discount'
import userModel from '../models/user'

export default {
  Query: {
    discount: async (parent, { id }, {  models: { discountModel }}, info) => {
      const discount = await discountModel.findById({ _id:id}).exec()
      return discount
    },

    discounts: async (parent, args, { models: { discountModel }}, info) => {
      const discounts = await discountModel.find().exec()
      return discounts
    },

    discountByCode: async (parent, { code, user }, {  models: { discountModel }}, info) => {
      const discount = await discountModel.findOne(
        { 
          discount: code,
          user: user
        }
      ).exec()
      return discount
    }
  },
  Mutation: {
    createDiscount: async (parent, { user, lessonDay, value, status, validityEnd }, { models: { discountModel }}, info) => {
      const discount = await discountModel.create({ user, lessonDay, value, status, validityEnd })
      return discount
    },

    updateDiscount: async (parent, { id, user, lessonDay, value, status, validityEnd }, { models:  { discountModel }}, info) => {
      const discount = await discountModel.updateDiscount(id, { user, lessonDay, value, status, validityEnd  })
      return discount
    },

    deleteDiscount: async (parent, { id }, { models: { discountModel }}, info) => {
      const discount = await discountModel.deleteDiscount(id)
      return discount
    }
  },
  Discount: {
    user: async({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return null
      const object = await userModel.findById({ _id: lesson }).exec()
      return object
    },
  }
}