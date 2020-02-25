import React from 'react'
import moment from 'moment'
import Loader from '../../global/Loader.js'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import { Dialog, Table, TableHead, TableRow, TableCell, TableBody, Grow, List, ListItem, ListItemText, Typography, Grid, Container, Paper, Box, Button, Tooltip, CardContent, Card, CardActions, IconButton, Divider } from '@material-ui/core'
import { Add, Info, Remove, LowPriority, Close } from '@material-ui/icons'
import { lessonSubTypeToString, lessonTypeToString } from '../../../utils/enumToString'
import { dateToDayString } from '../../../utils/dateTimeConverter'
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles'
import { useApolloClient, useQuery, useMutation } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { GET_LESSONS_WAITING_OR_GOING } from '../../../database/query/lessonQuery'
import { GET_LESSON_TYPES } from '../../../database/query/lessonTypeQuery'
import { GET_LESSON_SUB_TYPES } from '../../../database/query/lessonSubTypeQuery'
import { textAlign, borderRadius } from '@material-ui/system';

moment.locale('fr')

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
  listItem: {
    margin: 0
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
  },
  tableRoot: {
    verticalAlign: 'top',
    
  },
  tableHeader: {
    maxWidth: '15vh'
  },
  tableCell: {
    textAlign: 'center',
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
  }
}))

const DialogTitle = withStyles(useStyles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.rootModal} {...other}>
      <Typography className={classes.modalTypo} variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <Close />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const LessonPicker = ({ handleChangeCallback }) => {
  const classes = useStyles()
  const [selectedType, setSelectedType] = React.useState([3,"AQUA_BOXING"])
  const [selectedModalLesson, setSelectedModalLesson] = React.useState()
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
    data.lessonsWaitingOrGoing.forEach(element => {
      lessonsDic[element.lessonSubType.name].push(element)
    });
    setLessonsBySubType(lessonsDic)
    handleListItemClick('AQUA_BOXING', 3)
  }

  const handleListItemClick = (key, index) => {
    var lessonsByDay = [[], [], [], [], [], [], []]
    for(const lesson of lessonsBySubType[key]) {
      lessonsByDay[moment(lesson.recurenceBegin).weekday()].push(lesson)
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
    <div>
    <Container component="main" maxWidth="xl" className={classes.root}>
      <Grid container>
        <Grid item xs={2} sm={2}>
          <List className={classes.list}>
            {Object.keys(lessonsBySubType).map((key ,index) => {
              return(
                <div key={key}>
                  <ListItem alignItems="flex-start" selected={selectedType[0]=== index} onClick={event => handleListItemClick(key, index)}>
                    <ListItemText
                      className={classes.listItem}
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
                  <Divider />
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
                                    <Typography variant="body2" className={classes.cellType}>
                                      <strong>{lesson.lessonType.simpleName}</strong>
                                    </Typography>
                                  </CardContent>
                                  <CardActions className={classes.cardActions}>
                                  {lesson.isOpened ? (
                                    <div key={lesson.id}>
                                      <Tooltip title="Plus d'informations">
                                        <IconButton onClick={() => handleInfoModal(lesson)}>
                                          <Info />
                                        </IconButton>
                                      </Tooltip>
                                    {contains(bookedLessons, lesson) ? (
                                      <Tooltip title="Retirer le cours">
                                        <IconButton onClick={() => removeBookedLesson(lesson)}>
                                          <Remove />
                                        </IconButton>
                                      </Tooltip>
                                    ):(
                                      <Tooltip title="S'inscrire au cours">
                                        <IconButton onClick={() => addBookedLesson(lesson)}>
                                          <Add />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    </div>
                                  ):(
                                    <div>
                                      <Tooltip title="Plus d'informations">
                                        <IconButton onClick={() => handleInfoModal(lesson)}>
                                          <Info />
                                        </IconButton>
                                      </Tooltip>
                                    {contains(preBookedLessons, lesson) ? (
                                      <Tooltip title="Retirer le cours">
                                        <IconButton onClick={() => removePreBookedLesson(lesson)}>
                                          <Remove />
                                        </IconButton>
                                      </Tooltip>
                                    ):(
                                      <Tooltip title="Se pré-inscrire au cours">
                                        <IconButton onClick={() => addPreBookedLesson(lesson)}>
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
    <Dialog maxWidth="sm" fullWidth={true} open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
      <DialogTitle onClose={() => setOpenInfoModal(false)}>
          Informations du cours
      </DialogTitle>
      <DialogContent>
        <Container component="main" maxWidth="xl">
          <Grid container spacing={2}>
            <Grid item xs={6} md={6}>
                 Test 1
            </Grid>
            <Grid item xs={6} md={6}>

                 Test 2
            </Grid>
          </Grid>
        </Container>
      </DialogContent>
    </Dialog>
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