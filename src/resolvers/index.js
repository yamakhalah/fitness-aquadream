import userResolver from './userResolver'
import creditResolver from './creditResolver'
import discountResolver from './discountResolver'
import payementResolver from './payementResolver'
import teacherResolver from './teacherResolver'
import lessonDayResolver from './lessonDayResolver'
import lessonResolver from './lessonResolver'
import lessonTypeResolver from './lessonTypeResolver'
import lessonSubTypeResolver from './lessonSubTypeResolver'
import subscriptionResolver from './subscriptionResolver'
import errorLogResolver from './errorLogResolver'
import noShowDateResolver from './noShowDateResolver'

export default [lessonTypeResolver, lessonSubTypeResolver, userResolver, discountResolver, payementResolver, teacherResolver, lessonDayResolver, lessonResolver, creditResolver, subscriptionResolver, errorLogResolver, noShowDateResolver]