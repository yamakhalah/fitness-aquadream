import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import { CircularProgress, Tooltip, Button, DialogTitle, Dialog, DialogContent, DialogContentText, DialogActions, Container, CssBaseline, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid } from '@material-ui/core'
import { MeetingRoom, ExpandMore } from '@material-ui/icons'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { GET_LESSONS_WAITING_OR_GOING, GET_LESSONS } from '../../database/query/lessonQuery'
import { OPEN_LESSON } from '../../database/mutation/lessonMutation'
import { dateToDayString } from '../../utils/dateTimeConverter'
import moment from 'moment'

moment.locale('fr')

const styles = theme => ({
  root: {
    marginTop: 25,
    backgroundColor: 'white',
    paddingTop: 30,
    paddingBottom: 30
  },
  paper: {
    marginTop: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  formControl: {
    minWidth: '100%',
  },
  title: {
    marginTop: 25
  },

  titleCentered: {
    marginTop: 35,
    textAlign: 'center'
  },

  table: {
    marginTop: 35
  },

  row: {
    margin: 0,
    padding: 0
  },

  cell: {
    margin: 0,
    padding: 0
  },

  textCentered: {
    textAlign: 'center'
  },

  buttonProgress: {
    color: 'green',
    position: 'absolute',
    top: '50%',
    left: '50%'
  },

})

class AdminLesson extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lessons: [],
      openLessonDialog: false,
      loading: false,
      selectedLesson:  null,
      selectedIndex: null,
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
    }
  }

  componentDidMount() {
    this.props.client.query({
      query: GET_LESSONS_WAITING_OR_GOING
    })
    .then(result => {
      var lessons = result.data.lessonsWaitingOrGoing
      lessons.forEach((element, index) => {
        lessons[index].lessonsDay = this.sortLessonsDay(element.lessonsDay)
      });
      var sortedLessons = this.sortLessons(lessons)
      this.setState({ lessons: sortedLessons })
    })
    .catch(error => {
      console.log(error)
      this.showSnackMessage('Erreur lors de la récupération des cours', 'error')
    })
  }

  handleOpenLessonDialog = (lesson, index) => {
    this.setState({ 
      openLessonDialog: true,
      selectedLesson: lesson,
      selectedIndex: index
    })
  }

  handleOpenLessonClose = () => {
    this.setState({ openLessonDialog: false })
  }

  openLesson = () => {
    this.setState({
      loading: true
    })
    this.props.client.mutate({
      mutation: OPEN_LESSON,
      variables: {
        id: this.state.selectedLesson.id
      },
      refetchQueries: [
        {
          query: GET_LESSONS_WAITING_OR_GOING
        },
        {
          query: GET_LESSONS
        }
      ]
    })
    .then(result =>  {
      var lessons = this.state.lessons
      lessons[this.state.selectedIndex] = result.data.openLesson
      this.showSnackMessage('Le cours a bien été ouvert !', 'success')
      this.setState({
        openLessonDialog: false,
        loading: false,
        lessons: lessons
      })     
    })
    .catch(error =>  {
      this.showSnackMessage('Une erreur est survenue durant l\'ouverture', 'error')
      this.setState({
        openLessonDialog: false,
        loading: false
      }) 
    })
  }

  sortLessons = (lessons) => {
    return lessons.sort((a, b) => Date.parse(a.recurenceBegin) - Date.parse(b.recurenceBegin))
  }

  sortLessonsDay = (lessonsDay) => {
    return lessonsDay.sort((a, b) => Date.parse(a.dayDate) - Date.parse(b.dayDate))
  }

  showSnackMessage = (message, type) => {
    this.setState({
      errorMessage: message,
      errorVariant: type,
      openSnack: true
    })
  }

  handleSnackClose = () => {
    this.setState({ openSnack: false })
  }

  render() {
    const { classes } = this.props
    return(
      <div>
      {this.state.loading && <CircularProgress size={150} className={classes.buttonProgress} />} 
      <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <Typography component="h1" variant="h5">
          Liste des cours
        </Typography>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{width: '15%'}}>Nom</TableCell>
              <TableCell>Type de date</TableCell>
              <TableCell>Jour</TableCell>
              <TableCell>Date de début</TableCell>
              <TableCell>Date de fin</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Nombre de cours</TableCell>
              <TableCell>Places restantes</TableCell>
              <TableCell>Places disponibles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell style={{width: '10%'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.lessons.map((lesson, index) => (
            <Fragment key={lesson.id}>
              <TableRow key={lesson.id} className={classes.row}>
                <TableCell component="th" scope="row">{lesson.name}</TableCell> 
                <TableCell>{lesson.dateType}</TableCell>
                <TableCell>{dateToDayString(lesson.recurenceBegin)}</TableCell>
                <TableCell>{moment(lesson.recurenceBegin).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{moment(lesson.recurenceEnd).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{moment(lesson.lessonsDay[0].hour.begin, 'HH:mm').format('HH:mm')} à {moment(lesson.lessonsDay[0].hour.end, 'HH:mm').format('HH:mm')}</TableCell>
                <TableCell>{lesson.totalLessons}</TableCell> 
                <TableCell>{lesson.spotLeft}</TableCell>
                <TableCell>{lesson.spotTotal}</TableCell>
                <TableCell>{lesson.status}</TableCell>
                <TableCell>
                {lesson.isOpened ?
                  <div />
                  :
                  <Tooltip title="Ouvrir le cours">
                    <IconButton onClick={this.handleOpenLessonDialog.bind(this, lesson, index)}>
                      <MeetingRoom />
                    </IconButton>
                  </Tooltip>
                }
                </TableCell>    
              </TableRow>
              <TableRow className={classes.row}>
                <TableCell colSpan={2} className={classes.cell} />
                <TableCell colSpan={7} className={classes.cell}>
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMore />}
                    id="expandMore"
                  >
                    <Typography>Informations complètes</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                  <Container component="main" maxWidth="xl" className={classes.container}>
                    <Grid container spacing={2}>
                      <Grid item xs={4} sm={4}>
                        <Typography>
                          Type de cours:
                        </Typography>
                        <Typography>
                          Sous titre:
                        </Typography>
                        <Typography>
                          Discount ID 
                        </Typography>
                        <Typography>
                          Adresse:
                        </Typography>
                        <Typography>
                          Prix unitaire:
                        </Typography>
                        <Typography>
                          Prix unitaire dégressif:
                        </Typography>
                        <Typography>
                          Prix total:
                        </Typography>
                        <Typography>
                          Prix total dégressif:
                        </Typography>
                        <Typography>
                          Commentaire:
                        </Typography>
                      </Grid>
                      <Grid item xs={8} sm={8}>
                        <Typography>
                          {lesson.lessonType.simpleName} 
                        </Typography>
                        <Typography>
                          {lesson.lessonSubType.simpleName} 
                        </Typography>
                        <Typography>
                          {lesson.discount} 
                        </Typography>
                        <Typography>
                          {lesson.address.street} {lesson.address.postalCode} {lesson.address.city}
                        </Typography>
                        <Typography>
                          {lesson.pricing.unitPrice} €
                        </Typography>
                        <Typography>
                          {lesson.pricing.unitPrice2X} €
                        </Typography>
                        <Typography>
                          {lesson.pricing.totalPrice} €
                        </Typography>
                        <Typography>
                          {lesson.pricing.totalPrice2X} €
                        </Typography>
                        <Typography>
                          {lesson.comment}
                        </Typography>
                      </Grid>
                      <Grid item className={classes.title} xs={12} >
                        <Typography variant="h5">
                          Cours journaliers
                        </Typography>
                      </Grid>
                      
                      <Grid item className={classes.titleCentered} xs={2} md={2} >
                        <Typography variant="h6">
                            Professeur
                        </Typography>
                      </Grid>
                      <Grid item className={classes.titleCentered} xs={2} md={2} >
                        <Typography variant="h6">
                           Date
                        </Typography>
                      </Grid>
                      <Grid item className={classes.titleCentered} xs={2} md={2} >
                        <Typography variant="h6">
                          Heure 
                        </Typography>
                      </Grid>
                      <Grid item className={classes.titleCentered} xs={2} md={2} >
                        <Typography variant="h6">
                          Places Libres
                        </Typography>
                      </Grid>
                      <Grid item className={classes.titleCentered} xs={2} md={2} >
                        <Typography variant="h6">
                          Places Totales
                        </Typography>
                      </Grid>
                      <Grid item className={classes.titleCentered} xs={2} md={2} >
                        <Typography variant="h6">
                          Status 
                        </Typography>
                      </Grid>
                      {lesson.lessonsDay.map((lessonDay, index) => (
                        <Fragment key={index}>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                          <Typography>
                              {lessonDay.teacher.user.firstName} {lessonDay.teacher.user.lastName}
                          </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {moment(lessonDay.dayDate).format('DD/MM/YYYY')}
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')} à {moment(lessonDay.hour.end, 'HH:mm').format('HH:mm')} 
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {lessonDay.spotLeft}
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {lessonDay.spotLeft}  
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {lessonDay.isCanceled ?
                                'Annulé' :
                                'Planifié'
                              }
                            </Typography>
                          </Grid>
                        </Fragment>
                      ))}
                    </Grid>
                  </Container>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                </TableCell>
                <TableCell colSpan={2} className={classes.cell} />
              </TableRow>
            </Fragment>
            ))}
          </TableBody>
        </Table>
      </Container>
      <Dialog
        open={this.state.openLessonDialog}
      >
        <DialogTitle>Ouvrir le cours</DialogTitle>
        <DialogContent>
          <DialogContentText>Êtes-vous sûr de vouloir ouvrir ce cours ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleOpenLessonClose.bind(this)} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={this.openLesson.bind(this)} color="primary" disabled={this.state.loading}>
            Confirmer           
          </Button> 
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={this.state.openSnack}
        autoHideDuration={5000}
        onClose={this.handleSnackClose}
      >
        <CustomSnackBar
          onClose={this.handleSnackClose}
          variant={this.state.errorVariant}
          message={this.state.errorMessage}
        />
      </Snackbar>
      </div>
    )
  }
  
}

export default withApollo(withRouter(withStyles(styles)(AdminLesson)))