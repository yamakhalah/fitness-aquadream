import bcrypt from 'bcrypt'
import generator from 'generate-password'
import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server'
import { NOT_AUTHENTICATED, INVALID_CREDENTIALS } from '../error'
import { sendMail, RESET_MAIL, SIGN_UP, FROM } from '../mailer'
import userModel from '../models/user'
import subscriptionModel from '../models/subscription'
import creditModel from '../models/credit'
import discountModel from '../models/discount'
import lessonDayModel from '../models/lessonDay'
import errorLogModel from '../models/errorLog'
import teacherModel from '../models/teacher'
require('dotenv').config()

export default {
  Query: {
    user: async (parent, { id }, { models: { userModel }, me }, info) => {
      if (!me) {
        throw new AuthenticationError(NOT_AUTHENTICATED)
      }
      const user = await userModel.findById({ _id: id}).exec()
      return user
    },

    users: async (parent, args, { models: { userModel }, me }, info) => {
      if (!me) {
        throw new AuthenticationError(NOT_AUTHENTICATED)
      }
      const users = await userModel.find().exec()
      return users
    },

    login: async (parent, { email, password }, { models: { userModel } }, info) => {
      const user = await userModel.findOne({ email }).exec();

      if (!user) {
        throw new AuthenticationError(INVALID_CREDENTIALS);
      }

      const matchPasswords = bcrypt.compareSync(password, user.password);

      if (!matchPasswords) {
        throw new AuthenticationError(INVALID_CREDENTIALS);
      }

      const token = jwt.sign({ id: user.id }, process.env.HASH, { expiresIn: '1d' });

      return {
        token, user
      };
    },
  },
  Mutation: {
    createUser: async(parent, { email, password, firstName, lastName, phone, gender}, { models: { userModel }}, info) => {
      const user = await userModel.create({ email, password, firstName, lastName, phone, gender })
      if(user._id !== null) {
        var mail = await sendMail(FROM, user.email, 'Aquadream - Confirmation d\'inscription', SIGN_UP(user))
      }
      return user
    },

    updateUser: async(parent, { id, subscriptions, credits, discounts, activeLessonsDay, email, firstName, lastName, phone, gender, isAdmin, isTeacher, paidYearlyTax }, { models: { userModel }}, info) => {
      const user = await userModel.updateUser(id, { subscriptions, credits, discounts, activeLessonsDay, email, firstName, lastName, phone, gender, isAdmin, isTeacher, paidYearlyTax })
      return user
    },

    updateIsTeacher: async(parent, { id, isTeacher }, { models: { userModel }}, info) => {
      if(isTeacher) {
        const teacher = await teacherModel.create({ user: id })
      }

      const user = await userModel.findOneAndUpdate(
        { _id: id },
        { isTeacher: isTeacher },
        { new: true }
      )
      
      return user
    },

    updateIsAdmin: async(parent, { id, isAdmin }, { models: { userModel }}, info) => {
      const user = await userModel.findOneAndUpdate(
        { _id: id },
        { isAdmin: isAdmin },
        { new: true }
      )
      return  user
    },

    deleteUser: async(parent, { id }, { models: { userModel }}, info) => {
      const user = await userModel.deleteUser(id)
      return user
    },

    resetPassword: async(parent, { email }, { models: { userModel }}, info) => {
      try {
        var user = await userModel.findOne({ email: new RegExp('^'+email+'$', "i") })
        console.log(user)
        if(user === null) {
          return false
        }
        var password = generator.generate({
          length: 10,
          numbers: true
        })
        var hashedPassword = bcrypt.hashSync(password, 12)
        user.password = hashedPassword
        var newUser = await userModel.updateUser(user._id, user)
        var mail = await sendMail(FROM, newUser.email, 'Aquadream - Mot de passe réinitialisé', RESET_MAIL({firstName: newUser.firstName, lastName: newUser.lastName, password: password}))
        return true
      }catch(error){
        console.log(error)
        return false
      }    
    },

    changePassword: async(parent, { id, oldPassword, newPassword }, { models: { userModel }}, info) => {
      try {
        var user = await userModel.findById({ _id: id })
        if(user.length === 0) {
          return false
        }
        const matchPasswords = bcrypt.compareSync(oldPassword, user.password);

        if (!matchPasswords) {
          return new AuthenticationError('L\'ancien mot de passe n\'est pas correct');
        }
        var hashedPassword = bcrypt.hashSync(newPassword, SALT)
        user.password = hashedPassword
        var newUser = await userModel.updateUser(user._id, user)
        return true
      }catch(error) {
        return error
      }
    },

    addCreditToUser: async(parent, {id, credit}, { models: { userModel }}, info) => {
      const user = await userModel.addCredit(id, credit)
      return user
    },

    removeCreditFromUser: async(parent, {id, credit}, { models: { userModel }}, info) => {
      const user = await userModel.removeCredit(id, credit)
      return user
    }
  },
  User: {
    subscriptions: async({ subscriptions }, args, { models: { subscriptionModel }}, info) => {
      if(subscriptions === undefined) return null
      const subscriptionsList = []
      subscriptions.forEach(async (element) => {
        var object = await subscriptionModel.findById({ _id:element }).exec()
        subscriptionsList.push(object)
      });
      return subscriptionsList
    },

    credits: async({ credits }, args, { models: { creditModel }}, info) => {
      if(credits === undefined) return null
      const creditsList = []
      credits.forEach(async (element) => {
        var object = await creditModel.findById({ _id:element }).exec()
        creditsList.push(object)
      });
      return creditsList
    },

    discounts: async({ discounts }, args, { models: { discountModel }}, info) => {
      if(discounts === undefined) return null
      const discountsList = []
      discounts.forEach(async element => {
        var object = await discountModel.findById({ _id:element }).exec()
        discountsList.push(object)
      });
      return discountsList
    },

    activeLessonsDay: async({ lessonsDay }, args, { models: { lessonDayModel }}, info) => {
      if(lessonsDay === undefined) return null
      const lessonsDayList = []
      lessonsDay.forEach(async element => {
        var object = await lessonDayModel.findById({ _id:element }).exec()
        lessonsDayList.push(object)
      });
      return lessonsDayList
    },
  }
}