import React from 'react'
import moment from 'moment-timezone'
import Loader from '../../global/Loader.js'
import { DialogTitle, DialogContent, Dialog, Table, TableHead, TableRow, TableCell, TableBody, Grow, List, ListItem, ListItemText, Typography, Grid, Container, Paper, Box, Button, Tooltip, CardContent, Card, CardActions, IconButton, Divider } from '@material-ui/core'
import { Add, Info, Remove, LowPriority, Close } from '@material-ui/icons'
import { lessonSubTypeToString } from '../../../utils/enumToString'
import { dateToDayString } from '../../../utils/dateTimeConverter'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from 'react-apollo'
import { GET_LESSONS_WAITING_OR_GOING_FREE } from '../../../database/query/lessonQuery'
import { textAlign, borderRadius } from '@material-ui/system';

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

const useStyles = makeStyles(theme => ({
  rootModal: {
    margin: 0,
    padding: theme.spacing(2),
  },
  modal: {
    width: '30%'
  },
  modalTypo: {
    display: 'inlineBlock',
    width: '90%'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  root: {
    width: '100%',
    backgroundColor: 'theme.palette.background.paper',
    padding: 0,
    '& h2': {
      marginBlockStart: '2rem',
      marginBlockEnd: '0rem'
    },
    '& h3': {
      marginBlockStart: '3rem',
      marginBlockEnd: '0.7rem'
    },
    '& p': {
      fontSize: '1.2em',
      marginBlockStart: '0rem',
      marginBlockEnd: '0rem'
    }
  },
  list: {
    backgroundColor: theme.palette.primary.main,
    padding: 0
  },
  pickerListItem: {
    paddingTop: 20,
    paddingBottom: 20,
    "&$pickerListItem, &$pickerListItem:focus, &$pickerListItem:hover": {
      backgroundColor: theme.palette.secondary.main

    }
  },
  listItem: {
    margin: 0,
    color: 'white'
  },
  inline: {
    display: 'inline',
    color: 'white'
  },
  /*
  lessons: {
    backgroundColor: theme.palette.secondaryLight.main,
  },
  */
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tableRoot: {
    verticalAlign: 'top',
    
  },
  tableHeader: {
    maxWidth: '15vh'
  },
  tableCell: {
    textAlign: 'center',
    padding: 10
  },
  card: {
    width: '100%',
  },
  cardContent: {
    paddingBottom: 0,
  },
  cardActions: {
    display: 'block',
    marginTop: 0,
    padding: 0
  },
  cellTime: {

    color: 'white',
    backgroundColor: theme.palette.primary.main,
    padding: 6,
    borderRadius: 15,
    display: 'block'
  },
  cellType: {
    paddingTop: 5
  },
  gridTitle: {
  
  },
  gridData: {
  
  },
  greenIcon: {
    color: theme.palette.primary.main
  }
}))



const LessonPicker = ({ handleChangeCallback }) => {
  const classes = useStyles()
  const [selectedType, setSelectedType] = React.useState([2,"AQUA_BIKING"])
  const [selectedModalLesson, setSelectedModalLesson] = React.useState(null)
  const [openInfoModal, setOpenInfoModal] = React.useState(false)
  const [selectedLessons, setSelectedLessons] = React.useState([])
  const [selectedLessonsByDay, setSelectedLessonsByDay] = React.useState([[], [], [], [], [], [], []])
  const [bookedLessons, setBookedLessons] = React.useState([])
  const [preBookedLessons, setPreBookedLessons] = React.useState([])
  const [lessonsBySubType, setLessonsBySubType] = React.useState({
    "ACCOUTUMANCE_A_EAU": [],
    "APPRENTISSAGE_NAGE": [],
    "AQUA_BIKING": [],
    "AQUA_BOXING": [],
    "AQUA_FITNESS": [],
    "AQUA_GYM": [],
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
    data.lessonsWaitingOrGoingFree.forEach(lesson => {
      var element = {...lesson}
      element.pricing = {...element.pricing}
      var today = moment()
      var startDate = moment(element.recurenceBegin)
      var reduction1X = 0
      var reduction2X = 0
      var reduction3X = 0
      while(startDate.isSameOrBefore(today)) {
        reduction1X += element.pricing.unitPrice
        reduction2X += element.pricing.unitPrice2X
        reduction3X += element.pricing.unitPrice3X
        startDate.add(7, 'days')
      }
      var startDate = moment(element.recurenceBegin)
      while(startDate.isSameOrBefore(today)){
        startDate.add(1, 'months')
        element.totalMonth--
      }
      element.pricing.totalPrice = Math.ceil(element.pricing.totalPrice-reduction1X)
      element.pricing.totalPrice2X = Math.ceil(element.pricing.totalPrice2X-reduction2X)
      element.pricing.totalPrice3X = Math.ceil(element.pricing.totalPrice3X-reduction3X)
      element.pricing.monthlyPrice = Math.ceil(element.pricing.totalPrice/element.totalMonth)
      element.pricing.monthlyPrice2X = Math.ceil(element.pricing.totalPrice/element.totalMonth)
      element.pricing.monthlyPrice3X = Math.ceil(element.pricing.totalPrice/element.totalMonth)
      lessonsDic[element.lessonSubType.name].push(element)
    });
    setLessonsBySubType(lessonsDic)
    handleListItemClick('AQUA_BIKING', 2)
  }

  const handleListItemClick = (key, index) => {
    var lessonsByDay = [[], [], [], [], [], [], []]
    for(const lesson of lessonsBySubType[key]) {
      const weekday = moment(lesson.recurenceBegin).weekday()
      lessonsByDay[weekday].push(lesson)
    }
    setSelectedType([index,key])
    setSelectedLessonsByDay(lessonsByDay)
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

  const handleInfoModal = (lesson) => {
    setSelectedModalLesson(lesson)
    setOpenInfoModal(true)
  }

  const contains = (array, item) => {
    return array.some(v => (v.id === item.id ))
  }

  const getDayByIndex = (index) => {
    switch(index) {
      case 0:
        return 'Lundi'
        break
      case 1:
        return 'Mardi'
        break
      case 2:
        return 'Mercredi'
        break
      case 3:
        return 'Jeudi'
        break
      case 4:
        return 'Vendredi'
        break
      case 5:
        return 'Samedi'
        break
      case 6:
        return 'Dimanche'
        break
    }
  }

  const { loading, error, data } = useQuery(GET_LESSONS_WAITING_OR_GOING_FREE, { fetchPolicy: 'network-only', onCompleted: initLessonPicker } ) 

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
    <div>
    <Container component="main" maxWidth="xl" className={classes.root}>
      <Grid container>
        <Grid item xs={2} sm={2}>
          <List className={classes.list}>
            {Object.keys(lessonsBySubType).map((key ,index) => (
              <div key={key}>
              {lessonsBySubType[key].length > 0 && (
                <div>
                  <ListItem classes={{ selected: classes.pickerListItem }} alignItems="flex-start" selected={selectedType[0]=== index} onClick={event => handleListItemClick(key, index)}>
                    <ListItemText
                      className={classes.listItem}
                      primary={lessonSubTypeToString(key)}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                          >
                            {lessonsBySubType[key].length} cours disponibles
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              )}
              </div>
            ))}
          </List>
        </Grid>
        <Grid item xs={10} sm={10} className={classes.lessons}>
        <Box border={2} borderColor="primary.main" height="100%">
          {selectedLessons.length === 0 ? (
            <h1 className={classes.error}>Aucun cours dans cette catégorie</h1>
          ):(
            <div>
              <Table>
                <TableBody >
                <TableRow className={classes.tableRoot}>
                  {selectedLessonsByDay.map((lessonsByDay, index) => (
                    <TableCell className={classes.tableHeader} key={index}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell className={classes.tableCell}>{getDayByIndex(index)}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lessonsByDay.map(lesson => (
                            <TableRow key={lesson.id}>
                              <TableCell className={classes.tableCell}>
                                <Card className={classes.card}>
                                  <CardContent className={classes.cardContent}>
                                    <Typography variant="subtitle2" className={classes.cellTime}>
                                      {moment(lesson.recurenceBegin).format('HH:mm')} - {moment(lesson.recurenceEnd).format('HH:mm')}
                                    </Typography>
                                    <Typography variant="subtitle1" className={classes.cellType}>
                                      <strong>{lesson.lessonType.simpleName}</strong>
                                    </Typography>
                                  </CardContent>
                                  <CardActions className={classes.cardActions}>
                                  {lesson.isOpened ? (
                                    <div key={lesson.id}>
                                      <Tooltip title="Plus d'informations">
                                        <IconButton className={classes.greenIcon} onClick={() => handleInfoModal(lesson)}>
                                          <Info />
                                        </IconButton>
                                      </Tooltip>
                                    {contains(bookedLessons, lesson) ? (
                                      <Tooltip title="Retirer le cours">
                                        <IconButton className={classes.greenIcon} onClick={() => removeBookedLesson(lesson)}>
                                          <Remove />
                                        </IconButton>
                                      </Tooltip>
                                    ):(
                                      <Tooltip title="S'inscrire au cours">
                                        <IconButton className={classes.greenIcon} onClick={() => addBookedLesson(lesson)}>
                                          <Add />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    </div>
                                  ):(
                                    <div>
                                      <Tooltip title="Plus d'informations">
                                        <IconButton  className={classes.greenIcon} onClick={() => handleInfoModal(lesson)}>
                                          <Info />
                                        </IconButton>
                                      </Tooltip>
                                    {contains(preBookedLessons, lesson) ? (
                                      <Tooltip title="Retirer le cours">
                                        <IconButton className={classes.greenIcon} onClick={() => removePreBookedLesson(lesson)}>
                                          <Remove />
                                        </IconButton>
                                      </Tooltip>
                                    ):(
                                      <Tooltip title="Se pré-inscrire au cours">
                                        <IconButton className={classes.greenIcon} onClick={() => addPreBookedLesson(lesson)}>
                                          <LowPriority />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    </div>
                                  )}
                                  </CardActions>
                                </Card>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  ))}
                </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          </Box>
        </Grid>
      </Grid>
    </Container>
    {selectedModalLesson !== null && (
      <Dialog maxWidth="xs" fullWidth={true} open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
        <DialogTitle className={classes.rootModal} onClose={() => setOpenInfoModal(false)}>
            Informations du cours
            <IconButton aria-label="close" className={classes.closeButton} onClick={() => setOpenInfoModal(false)}>
              <Close />
            </IconButton>
        </DialogTitle>
        <DialogContent>
          <Container component="main" maxWidth="xl">
            <Typography variant='h6'>{selectedModalLesson.name}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                Description:
              </Grid>
              <Grid item xs={12} md={7}>
                {selectedModalLesson.comment}
              </Grid>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                Type de réservation
              </Grid>
              {selectedModalLesson.isOpened ? (
                <Grid item xs={12} md={7}>
                  <strong>Inscription</strong>
                </Grid>
              ):(
                <Grid item xs={12} md={7}>
                  <strong>Pré-Inscription</strong>
                </Grid>
              )}
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                  Jour:
              </Grid>
              <Grid item xs={12} md={7}>
                {dateToDayString(selectedModalLesson.recurenceBegin)}
              </Grid>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                  Début:
              </Grid>
              <Grid item xs={12} md={7}>
                {moment(selectedModalLesson.recurenceBegin).format('DD/MM/YYYY')}
              </Grid>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                  Fin:
              </Grid>
              <Grid item xs={12} md={7}>
                {moment(selectedModalLesson.recurenceEnd).format('DD/MM/YYYY')}
              </Grid>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                  Places restantes:
              </Grid>
              <Grid item xs={12} md={7}>
                {selectedModalLesson.spotLeft}
              </Grid>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                  Prix mensuel:
              </Grid>
              <Grid item xs={12} md={7}>
                {selectedModalLesson.pricing.monthlyPrice}€
              </Grid>
              <Grid item xs={12} md={5} className={classes.gridTitle}>
                  Prix total:
              </Grid>
              <Grid item xs={12} md={7}>
                {selectedModalLesson.pricing.totalPrice}€
              </Grid>
            </Grid>
          </Container>
        </DialogContent>
      </Dialog>
    )}
    </div>
  )
}

export default LessonPicker


/*

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
          */