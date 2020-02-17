import React from 'react'
import moment from 'moment'
import Loader from '../global/Loader.js'
import localizer from 'react-big-calendar/lib/localizers/globalize'
import globalize from 'globalize'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useQuery, useMutation } from  '@apollo/react-hooks'
import { useApolloClient } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { Container } from '@material-ui/core'
import { GET_ACTIVE_LESSONS_DAY_FOR_USER } from '../../database/query/lessonDayQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import 'react-big-calendar/lib/css/react-big-calendar.css'; 

moment.locale('fr')
const globalizeLocalizer = localizer(globalize)
const useStyles = makeStyles(theme => ({

}))

const Home = () => {
  const classes = useStyles()
  const [user, setUser] = React.useState(useApolloClient().readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const [loading, setLoading] = React.useState(true)
  const [lessonsDay, setLessonsDay] = React.useState([])
  const [events, setEvents] = React.useState([])
  const [views, setViews] = React.useState([])
  const [localizer, setLocalizer] = React.useState(momentLocalizer(moment))
  const ColoredDateCellWrapper = ({ children }) => {
    React.cloneElement(React.Children.only(children), {
      style: {
        backgroundColor: 'lightblue',
      },
    })
  }

  const initCalendar = (data) => {
    setLessonsDay(data.activeLessonsDayForUser)
    var events = []
    for(const lessonDay of data.activeLessonsDayForUser){
      var beginTime = lessonDay.hour.begin.split(':')
      var endTime = lessonDay.hour.end.split(':')
      var begin = moment(lessonDay.dayDate).hour(Number(beginTime[0])).minute(Number(beginTime[1]))
      var end = moment(lessonDay.dayDate).hour(Number(endTime[0])).minute(Number(endTime[1]))
      console.log(begin.toDate())
      const event = {
        id: lessonDay.id,
        title: lessonDay.lesson.name,
        start: begin.toDate(),
        end: end.toDate(),
        desc: lessonDay.lesson.comment,
      }
      events.push(event)
    }
    const views = ['month','week']
    setEvents(events)
    setViews(views)
    setLoading(false)
  }
  console.log(user)
  const { load, error, data } = useQuery(GET_ACTIVE_LESSONS_DAY_FOR_USER, { fetchPolicy: 'network-only', variables: { user: user.userID}, onCompleted: initCalendar})

  if (loading) return (
    <div className={classes.loader}>
      <Loader />
    </div>
  )

  if (error) return (
    <div className={classes.errorText}>
      <h2 className={classes.error}>Erreur lors de la récupération des cours</h2>
      <p>{error.message}</p>
    </div>
  )

  if(data) return(
    <div style={{ height: 900 }}>
      <Calendar
        events={events}
        views={views}
        defaultView={Views.WEEK}
        step={60}
        defaultDate={moment().toDate()}
        localizer={globalizeLocalizer}
      />
    </div>
  )
}

export default Home