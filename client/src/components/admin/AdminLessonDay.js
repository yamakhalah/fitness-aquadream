import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import { CircularProgress, Button, Tooltip, Container, CssBaseline, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core'
import { ExpandMore, Delete, Edit } from '@material-ui/icons'
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { GET_LESSONS_DAY_FROM_TODAY } from '../../database/query/lessonDayQuery'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { UPDATE_LESSON_DAY, CANCEL_LESSON_DAY } from '../../database/mutation/lessonDayMutation'
import { dateToDayString } from '../../utils/dateTimeConverter'
import DateFnsUtils from '@date-io/date-fns'
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
    marginTop: theme.spacing(2),
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

  redIcon: {
    color: "red"
  },

  greenIcon: {
    color: "green"
  },

  maxWidth: {
    width: '100%'
  },

  buttonProgress: {
    color: 'green',
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
})

class AdminLessonDay extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      teachers: [],
      lessonsDay: [],
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
      openEditDialog: false,
      openDeleteDialog: false,
      selectedLessonDay: null,
      selectedIndex: -1,
      message: '',
      loading: true,
    }
  }

  componentDidMount() {
    var today = moment().toISOString(true)
    this.props.client.watchQuery({
      query: GET_LESSONS_DAY_FROM_TODAY,
      fetchPolicy: 'cache-and-network',
      variables: {
        today: today
      }
    })
    .subscribe(({ data, loading, error}) => {
      if(error) {
        this.showSnackMessage('Erreur lors de la récupération des cours', 'error')
      }else if (data){
        var lessonsDay = this.sortLessonsDay(data.lessonsDayFromToday)
        this.setState({ lessonsDay: lessonsDay, loading: false })
      }
    })

    this.props.client.query({
      query: GET_TEACHERS
    }).then(result => {
      this.setState({ teachers: result.data.teachers })
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la récupération des professeurs', 'error')
    })
  }

  handleSnackClose = () => {
    this.setState({ openSnack: false })
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

  handleDialogChange = (event) => {
    event.persist()
    var lessonDay = this.state.selectedLessonDay
    switch(event.target.name) {
      case 'teacher':
        lessonDay.teacher.id = event.target.value
        this.setState({ selectedLessonDay: lessonDay })
        return
      case 'spotTotal':
        lessonDay.spotTotal = event.target.value
        this.setState({ selectedLessonDay: lessonDay })
        return
      case 'spotLeft':
        lessonDay.spotLeft = event.target.value
        this.setState({ selectedLessonDay: lessonDay })
        return
      case 'message':
        this.setState({ message: event.target.value })
        return
      default:
       console.log('UNEXCEPTED BEHAVIOR')
        break
    }
  }

  handleDialogDateChange = (event, id) => {
    var lessonDay = this.state.selectedLessonDay
    switch(id) {
      case 'timeBegin':
        lessonDay.hour.begin = moment(event).format('HH:mm')
        this.setState({ selectedLessonDay: lessonDay })
        return
      case 'timeEnd':
        lessonDay.hour.end = moment(event).format('HH:mm')
        this.setState({ selectedLessonDay: lessonDay })
        return
    }
  }

  sortLessonsDay = (lessonsDay) => {
    return lessonsDay.sort((a, b) => Date.parse(a.dayDate) - Date.parse(b.dayDate))
  }


  openEditDialog = (lessonDay) => {
    this.setState({ 
      selectedLessonDay: lessonDay,
      openEditDialog: true
    })
  }

  closeEditDialog = () => {
    this.setState({ 
      openEditDialog: false
    })
  }

  openDeleteDialog = (lessonDay, index) => {
    this.setState({ 
      selectedLessonDay: lessonDay,
      selectedIndex: index,
      openDeleteDialog: true
    })
  }

  closeDeleteDialog = () => {
    this.setState({ 
      openDeleteDialog: false
    })
  }

  modifyLessonDay = () => {
    var lessonDay = this.state.selectedLessonDay
    var users = this.state.selectedLessonDay.users
    var tmp = []
    users.forEach(element => {
      tmp.push(element.id)
    });
    lessonDay.users = tmp
    
    this.props.client.mutate({
      mutation: UPDATE_LESSON_DAY,
      variables: {
        id: lessonDay.id,
        lesson: lessonDay.lesson.id,
        teacher: lessonDay.teacher.id,
        users: users,
        dayDate: lessonDay.dayDate,
        hour: { begin: lessonDay.hour.begin, end: lessonDay.hour.end },
        spotLeft: lessonDay.spotLeft,
        spotTotal: lessonDay.spotTotal,
        isCanceled: lessonDay.isCanceled
      }
    })
    .then(result => {
      this.closeDialog()
      this.showSnackMessage('Le cours a bien été modifié', 'success')
    })
    .catch(error => {
      this.closeDialog()
      this.showSnackMessage('Une erreur est survenue durant la modification', 'error')
    })
  }

  deleteLessonDay = () => {
    var lessonDay = this.state.selectedLessonDay
    var users = this.state.selectedLessonDay.users
    var tmp = []
    users.forEach(element => {
      tmp.push({ id: element.id, firstName: element.firstName, lastName: element.lastName, email: element.email })
    });
    lessonDay.users = tmp

    this.props.client.mutate({
      mutation: CANCEL_LESSON_DAY,
      variables: {
        id: lessonDay.id,
        lesson: lessonDay.lesson.id,
        teacher: lessonDay.teacher.id,
        users: lessonDay.users,
        dayDate: lessonDay.dayDate,
        hour: { begin: lessonDay.hour.begin, end: lessonDay.hour.end },
        spotLeft: lessonDay.spotLeft,
        spotTotal: lessonDay.spotTotal,
        isCanceled: true,
        message: this.state.message
      }
    })
    .then(result => {
      var lessonsDay = this.state.lessonsDay
      lessonsDay[this.state.selectedIndex].isCanceled = false
      this.setState({ 
        lessonsDay: lessonsDay,
        message: ''
      })
      this.closeDeleteDialog()
      this.showSnackMessage('Le cours a bien été annulé', 'success')
    })
    .catch(error => {
      this.closeDeleteDialog()
      this.showSnackMessage('Une erreur est survenue durant la modification', 'error')
    })
  }

  render() {
    const { classes } = this.props
    if(this.state.loading) {
      return <CircularProgress size={150} className={classes.buttonProgress} />
    }
    return(
      <div>
        <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <Typography component="h1" variant="h5">
          Liste des cours quotidiens
        </Typography>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{width: '15%'}}>Nom</TableCell>
                <TableCell>Jour</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Heure</TableCell>
                <TableCell>Professeur</TableCell>
                <TableCell>Clients</TableCell>
                <TableCell>Places restantes</TableCell>
                <TableCell>Places disponibles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell style={{width: '10%'}}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.lessonsDay.map((lessonDay, index) => (
                <Fragment key={lessonDay.id}>
                  <TableRow className={classes.row}>
                    <TableCell component="th" scope="row">{lessonDay.lesson.name}</TableCell>
                    <TableCell>{dateToDayString(lessonDay.dayDate)}</TableCell>
                    <TableCell>{moment(lessonDay.dayDate).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>{moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')} à {moment(lessonDay.hour.end, 'HH:mm').format('HH:mm')}</TableCell>
                    <TableCell>{lessonDay.teacher.user.firstName} {lessonDay.teacher.user.lastName}</TableCell>
                    <TableCell>
                      <ExpansionPanel>
                        <ExpansionPanelSummary
                          expandIcon={<ExpandMore />}
                          id="expandMore"
                        >
                          <Typography>{lessonDay.users.length} personnes</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <Grid container spacing={2}>
                            {lessonDay.users.map((user, index) => (
                              <Grid item xs={12} md={12} key={user.id+' '+lessonDay.id}>
                                <Typography>
                                {user.firstName} {user.lastName}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    </TableCell>
                    <TableCell>{lessonDay.spotLeft}</TableCell>
                    <TableCell>{lessonDay.spotTotal}</TableCell>
                    <TableCell>{lessonDay.isCanceled ? 'Annulé' : 'Planifié'}</TableCell>
                    <TableCell>
                      {!lessonDay.isCanceled &&
                      <Tooltip title="Supprimer le cours">
                        <IconButton className={classes.redIcon} onClick={this.openDeleteDialog.bind(this, lessonDay, index)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      }
                      <Tooltip title="Modifier le cours">
                        <IconButton className={classes.greenIcon} onClick={this.openEditDialog.bind(this, lessonDay, index)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </Container>
        <Dialog open={this.state.openEditDialog}>
          <DialogTitle>Modifier le cours</DialogTitle>
          <DialogContent>
          <Container component="main" maxWidth="xl" className={classes.container}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={6}>
                <TextField
                  autoFocus
                  id="name"
                  label="Nom"
                  type="text"
                  value={this.state.selectedLessonDay ? this.state.selectedLessonDay.lesson.name : ''}
                  disabled
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <FormControl required className={classes.formControl}>
                  <InputLabel id="lessonTeacher">Professeur</InputLabel>
                  <Select
                    labelId="teacher"
                    id="teacher"
                    value={this.state.selectedLessonDay ? this.state.selectedLessonDay.teacher.id : ''}
                    name="teacher"
                    label="Professeur"
                    onChange={event => this.handleDialogChange(event)}
                  >
                    <MenuItem disabled>
                      Professeur
                    </MenuItem>
                    {this.state.teachers.map(teacher =>               
                      <MenuItem key={teacher.id} value={teacher.id}>{teacher.user.firstName} {teacher.user.lastName}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid item xs={6} md={6}>
                <KeyboardTimePicker
                  required
                  name="timeBegin"
                  margin="normal"
                  id="timeBegin"
                  label="Heure de début"
                  ampm={false}
                  value={this.state.selectedLessonDay ? moment(this.state.selectedLessonDay.hour.begin, 'HH:mm') : moment()}
                  onChange={event => this.handleDialogDateChange(event , 'timeBegin')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner Heure'
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
              <KeyboardTimePicker
                  required
                  name="timeEnd"
                  margin="normal"
                  id="timeEnd"
                  label="Heure de fin"
                  ampm={false}
                  value={this.state.selectedLessonDay ? moment(this.state.selectedLessonDay.hour.end, 'HH:mm') : moment()}
                  onChange={event => this.handleDialogDateChange(event, 'timeEnd')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner Heure'
                  }}
                />
              </Grid>
              </MuiPickersUtilsProvider>
              <Grid item xs={6} md={6}>
                <TextField
                  required
                  name="spotLeft"
                  id="spotLeft"
                  label="Places restantes"
                  type="text"
                  value={this.state.selectedLessonDay ? this.state.selectedLessonDay.spotLeft : 0}
                  onChange={event => this.handleDialogChange(event)}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <TextField
                  required
                  name="spotTotal"
                  id="spotTotal"
                  label="Places totales"
                  type="text"
                  value={this.state.selectedLessonDay ? this.state.selectedLessonDay.spotTotal : 0}
                  onChange={event => this.handleDialogChange(event)}
                />
              </Grid>
            </Grid>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeEditDialog.bind(this)}>
              Annuler 
            </Button>
            <Button color="primary" onClick={this.modifyLessonDay.bind(this)}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.openDeleteDialog}>
          <DialogTitle>Annuler le cours</DialogTitle>
          <DialogContent>
            <Typography>Ecrivez un message à envoyer aux clients </Typography>
            <TextField
              className={classes.form}
              label="Votre message"
              name="message"
              id="message"
              multiline
              required
              value={this.state.message}
              onChange={event => this.handleDialogChange(event)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDeleteDialog.bind(this)}>
              Annuler 
            </Button>
            <Button color="primary" onClick={this.deleteLessonDay.bind(this)}>
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

export default withApollo(withRouter(withStyles(styles)(AdminLessonDay)))