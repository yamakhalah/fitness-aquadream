import React from 'react'
import moment from 'moment'
import Loader from '../../global/Loader.js'
import { Grow, List, ListItem, ListItemText, Typography, Grid, Container, Paper, Box, Button, Tooltip } from '@material-ui/core'
import { lessonSubTypeToString, lessonTypeToString } from '../../../utils/enumToString'
import { dateToDayString } from '../../../utils/dateTimeConverter'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useQuery, useMutation } from  '@apollo/react-hooks'
import { useApolloClient } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { GET_LESSONS_WAITING_OR_GOING } from '../../../database/query/lessonQuery'
import { GET_LESSON_TYPES } from '../../../database/query/lessonTypeQuery'
import { GET_LESSON_SUB_TYPES } from '../../../database/query/lessonSubTypeQuery'

moment.locale('fr')

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: 'theme.palette.background.paper',
    padding: 0,
    '& h2': {
      marginBlockStart: '2rem',
      marginBlockEnd: '1rem'
    },
    '& h3': {
      marginBlockStart: '3rem',
      marginBlockEnd: '0.7rem'
    },
    '& p': {
      fontSize: '1.2em',
      marginBlockStart: '0.3rem',
      marginBlockEnd: '1rem'
    }
  },
  list: {
    backgroundColor: theme.palette.primary.main,
    padding: 0

  },
  inline: {
    display: 'inline',
  },
  lessons: {
  },
  lessonPaper: {
    backgroundColor: theme.palette.aquawhite.main,
    padding: theme.spacing(1),
    margin: theme.spacing(3)
  },
  loader: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    marginTop: '10rem'
  }
}))

const LessonPicker = ({ handleChangeCallback }) => {
  const classes = useStyles()
  const [selectedType, setSelectedType] = React.useState([3,"AQUA_BOXING"])
  const [selectedLessons, setSelectedLessons] = React.useState([])
  const [bookedLessons, setBookedLessons] = React.useState([])
  const [preBookedLessons, setPreBookedLessons] = React.useState([])
  const [lessonsBySubType, setLessonsBySubType] = React.useState({
    "ACCOUTUMANCE_A_EAU": [],
    "APPRENTISSAGE_NAGE": [],
    "AQUA_BIKING": [],
    "AQUA_BOXING": [],
    "AQUA_FITNESS": [],
    "AQUA_RELAXATION": [],
    "AQUA_SIRENE": [],
    "AQUA_ZUMBA": [],
    "BEBE_NAGEUR": [],
    "INITIATION_WATERPOLO": [],
    "INITIATION_PLONGEE": [],
    "JARDIN_AQUATIQUE": [],
    "OSTEOPATHIE_EAU": [],
    "PERFECTIONNEMENT_NAGE": [],
    "POST_NATAL_AQUATIQUE": [],
    "PREPARATION_PRENATALE": [],

  })

  const initLessonPicker = (data) => {
    var lessonsDic = lessonsBySubType
    console.log(data.lessonsWaitingOrGoing)
    data.lessonsWaitingOrGoing.forEach(element => {
      lessonsDic[element.lessonSubType.name].push(element)
    });
    setLessonsBySubType(lessonsDic)
    setSelectedLessons(lessonsBySubType["AQUA_BOXING"])
  }

  const handleListItemClick = (key, index) => {
    setSelectedType([index,key])
    setSelectedLessons(lessonsBySubType[key])
  }

  const addBookedLesson = (lesson) => {
    var lessons = bookedLessons
    lessons.push(lesson)
    setBookedLessons([...lessons])
    handleChangeCallback(bookedLessons, preBookedLessons)
  }

  const removeBookedLesson = (lesson) => {
    var lessons = bookedLessons
    const index = lessons.indexOf(lesson)
    lessons.splice(index, 1)
    setBookedLessons([...lessons])
    handleChangeCallback(bookedLessons, preBookedLessons)
  }

  const addPreBookedLesson = (lesson) => {
    var lessons = preBookedLessons
    lessons.push(lesson)
    setPreBookedLessons([...lessons])
    handleChangeCallback(bookedLessons, preBookedLessons)
  }

  const removePreBookedLesson = (lesson) => {
    var lessons = preBookedLessons
    const index = lessons.indexOf(lesson)
    lessons.splice(index, 1)
    setPreBookedLessons([...lessons])
    handleChangeCallback(bookedLessons, preBookedLessons)
  }

  const contains = (array, item) => {
    return array.some(v => (v.id === item.id ))
  }

  const { loading, error, data } = useQuery(GET_LESSONS_WAITING_OR_GOING, { fetchPolicy: 'network-only', onCompleted: initLessonPicker } ) 

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

  if(data) return (
    <Container component="main" maxWidth="xl" className={classes.root}>
      <Grid container>
        <Grid item xs={2} sm={2}>
          <List className={classes.list}>
            {Object.keys(lessonsBySubType).map((key ,index) => {
              return(
                <div key={key}>
                  <ListItem alignItems="flex-start" selected={selectedType[0]=== index} onClick={event => handleListItemClick(key, index)}>
                    <ListItemText
                      primary={lessonSubTypeToString(key)}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                          >
                            {lessonsBySubType[key].length} cours disponibles
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </div>
              )
            })}
          </List>
        </Grid>
        <Grid item xs={10} sm={10} className={classes.lessons}>
        <Box border={2} borderColor="primary.main" height="100%">
          {selectedLessons.length === 0 ? (
            <h1 className={classes.error}>Aucun cours dans cette catégorie</h1>
          ):(
            <Grid container>
              {selectedLessons.map((lesson) => {
                return(
                  <Grid item xs={4} sm={4} key={lesson.id}>
                    <Paper className={classes.lessonPaper}>
                      <h1>{lesson.name}</h1>
                      <h2>Informations</h2>
                      <p>Cours pour <strong>{lesson.lessonType.simpleName}</strong></p> 
                      <p>Tous les <strong>{dateToDayString(lesson.recurenceBegin)}</strong></p>
                      <p>Du <strong>{moment(lesson.recurenceBegin).format('DD/MM/YYYY')}</strong> au <strong>{moment(lesson.recurenceEnd).format('DD/MM/YYYY')}</strong></p>
                      <p><strong>{lesson.spotLeft}</strong> places restantes</p>
                      <p>Prix mensuel: <strong>{lesson.pricing.monthlyPrice}€</strong></p>
                      <p>Prix total: <strong>{lesson.pricing.totalPrice}€</strong></p>
                      {lesson.isOpened ? (
                        <div>
                        <h2>Inscription</h2>
                        {contains(bookedLessons, lesson) ? (
                          <Button onClick={() => removeBookedLesson(lesson)}>
                            Retirer
                          </Button>
                        ):(
                          <Button onClick={() => addBookedLesson(lesson)}>
                            Ajouter au panier
                          </Button>
                        )}
                        </div>
                      ):(
                        <div>
                        <Tooltip title="Une pré-inscription signifie que le cours n'est pas encore disponible. Vous serez notifiée lorsque ce sera le cas. Se pré-inscrire est totalement gratuit et vous permet d'être prévenu à l'avance lors de l'ouverture du cours">
                        <h2>Pré-Inscription uniquement</h2>
                        </Tooltip>
                        {contains(preBookedLessons, lesson) ? (
                          <Button onClick={() => removePreBookedLesson(lesson)}>
                            Retirer
                          </Button>
                        ):(
                          <Button onClick={() => addPreBookedLesson(lesson)}>
                            Ajouter au panier
                          </Button>
                        )}
                        </div>
                      )}
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default LessonPicker