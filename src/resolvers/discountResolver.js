import discountModel from '../models/discount'
import userModel from '../models/user'

import { sendMail, FROM, ADMIN_DISCOUNT } from '../mailer'
import crypto from 'crypto'
import moment from 'moment'
moment.locale('fr')

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
    createDiscount: async (parent, { user, subcription, value, status, validityEnd }, { models: { discountModel }}, info) => {
      const discount = await discountModel.create({ user, subscription, value, status, validityEnd })
      return discount
    },

    updateDiscount: async (parent, { id, user, subscription, value, status, validityEnd }, { models:  { discountModel }}, info) => {
      const discount = await discountModel.updateDiscount(id, { user, subscription, value, status, validityEnd  })
      return discount
    },

    deleteDiscount: async (parent, { id }, { models: { discountModel }}, info) => {
      const discount = await discountModel.deleteDiscount(id)
      return discount
    },

    adminCreateDiscount: async (parent, { user, value }, { models: { discountModel, userModel }}, info) => {
      var graphqlUser = await userModel.findById(user)
      const tmp = { 
        user: user,
        discount: crypto.randomBytes(6).toString('hex').toUpperCase(),
        value: value,
        status: 'NOT_USED',
        validityEnd: moment().add(1, 'years')
      }
      const discount = await discountModel.create(tmp)
      var mail = await sendMail(FROM, graphqlUser.email, 'Aquadream - Un bon d\'achat a été généré', ADMIN_DISCOUNT(graphqlUser, discount))
      return discount
    },
  },
  Discount: {
    user: async({ user }, args, { models: { userModel }}, info) => {
      if(user === undefined) return null
      const object = await userModel.findById({ _id: lesson }).exec()
      return object
    },
  }
}