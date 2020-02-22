import React from 'react'
import moment from 'moment'
import Loader from '../global/Loader.js'
import localizer from 'react-big-calendar/lib/localizers/globalize'
import globalize from 'globalize'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useApolloClient, useQuery, useMutation } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { Grid, Typography, Button, Container, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import { GET_ACTIVE_LESSONS_DAY_FOR_USER } from '../../database/query/lessonDayQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { CANCEL_LESSON_DAY_FOR_USER } from '../../database/mutation/lessonDayMutation'
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
require('globalize/lib/cultures/globalize.culture.fr')

moment.locale('fr')
const globalizeLocalizer = localizer(globalize)
const useStyles = makeStyles(theme => ({
  loader: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButton: {
    color: '#C0392B'
  }
}))

const Home = () => {
  const classes = useStyles()
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(useApolloClient().readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const [loading, setLoading] = React.useState(true)
  const [lessonsDay, setLessonsDay] = React.useState([])
  const [selectedLessonDay, setSelectedLessonDay] = React.useState(null)
  const [events, setEvents] = React.useState([])
  const [views, setViews] = React.useState([])
  const [localizer, setLocalizer] = React.useState(momentLocalizer(moment))
  const [infoModal, setInfoModal] = React.useState(false)


  const initCalendar = (data) => {
    setLessonsDay(data.activeLessonsDayForUser)
    var events = []
    var lLessonsDay = {}
    for(const lessonDay of data.activeLessonsDayForUser){
      var beginTime = lessonDay.hour.begin.split(':')
      var endTime = lessonDay.hour.end.split(':')
      var begin = moment(lessonDay.dayDate).hour(Number(beginTime[0])).minute(Number(beginTime[1]))
      var end = moment(lessonDay.dayDate).hour(Number(endTime[0])).minute(Number(endTime[1]))
      const event = {
        id: lessonDay.id,
        title: lessonDay.lesson.name,
        start: begin.toDate(),
        end: end.toDate(),
        desc: lessonDay.lesson.comment,
      }
      lLessonsDay[lessonDay.id] = lessonDay
      events.push(event)
    }
    const views = ['month','week']
    setEvents(events)
    setLessonsDay(lLessonsDay)
    setViews(views)
    setLoading(false)
  }

  const eventStyleGetter = (event, start, end, isSelected) => {
    var lessonDay = lessonsDay[event.id]
    var style = {}
    if(lessonDay.isCanceled) {
      style = {
        backgroundColor: '#C0392B'
      }
    }else{
      style = {
        backgroundColor: '#00A9E0'
      }
    }
    return {
      style: style
    }
  }
  
  const toggleInfoModal = (event) => {
    if(!infoModal) {
      setSelectedLessonDay(lessonsDay[event.id])
      setInfoModal(true)
    }else{
      setSelectedLessonDay(null)
      setInfoModal(false)
    }
  }

  const handleCancel = () => {
    setLoading(true)
    
    client.mutate({
      mutation: CANCEL_LESSON_DAY_FOR_USER,
      variables: {
        user: { id: user.userID, firstName: user.firstName, lastName: user.lastName, email: user.email },
        lessonDay: selectedLessonDay.id
      },
      refetchQueries: [{
        query: GET_ACTIVE_LESSONS_DAY_FOR_USER,
        variables: {
          user: user.userID
        }
      }]
    })
    .then(result => {
      console.log(result)
    })
    .catch(error => {
      console.log(error)
    })
  }

  const canBeCanceled = () => {
    if(moment(selectedLessonDay.dayDate).isBefore(moment())){
      return false
    }
    if(selectedLessonDay.isCanceled){
      return false
    }
    return true
  }

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
        culture='fr'
        selectable
        onSelectEvent={toggleInfoModal}
        eventPropGetter={eventStyleGetter}
      />
      <Dialog open={infoModal}>
        <DialogTitle>Informations sur votre cours</DialogTitle>
        <DialogContent>
          <Container component="main" maxWidth="xl" className={classes.container}>
            <Grid container spacing={2}>
              {selectedLessonDay !== null &&  (
                <div>
                  <Typography>Infos</Typography>
                  <p>Date du cours: {moment(selectedLessonDay.dayDate).format('DD/MM/YYYY')}</p>
                  <Typography>Addresse</Typography>
                  <p>{selectedLessonDay.lesson.address.street} {selectedLessonDay.lesson.address.postalCode} {selectedLessonDay.lesson.address.city}</p>
                </div>
              )}
            </Grid>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleInfoModal.bind(this)} color="default" disabled={loading}>
            Retour           
          </Button>
          {selectedLessonDay !== null &&  (
            <div>
            {console.log(moment(selectedLessonDay.dayDate).isSameOrAfter(moment()))}
            {console.log(selectedLessonDay.isCanceled)}
            {canBeCanceled() && (
              <Button onClick={handleCancel.bind(this)} className={classes.cancelButton} disabled={loading}>
                Annuler le cours          
              </Button> 
            )} 
            </div>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Home