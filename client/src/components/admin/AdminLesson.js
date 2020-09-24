import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers'
import { FormControl, InputLabel, Select, MenuItem, TextField, TablePagination, CircularProgress, Tooltip, Button, DialogTitle, Dialog, DialogContent, DialogContentText, DialogActions, Container, CssBaseline, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid } from '@material-ui/core'
import { Email, MeetingRoom, ExpandMore, Edit, Delete, Info, CollectionsBookmarkRounded } from '@material-ui/icons'
import { CustomSnackBar } from '../global/CustomSnackBar'
import MaterialTable from 'material-table'
import Excel from 'exceljs'
import { GET_LESSONS_WAITING_OR_GOING_FULL, GET_LESSONS } from '../../database/query/lessonQuery'
import { OPEN_LESSON, UPDATE_LESSON, CANCEL_LESSON, DELETE_LESSON } from '../../database/mutation/lessonMutation'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { SEND_MULTI_EMAIL } from '../../database/query/userQuery'
import { dateToDayString } from '../../utils/dateTimeConverter'
import DateFnsUtils from '@date-io/date-fns'
import frLocale from "date-fns/locale/fr";
import FileSaver from 'file-saver'
import moment from 'moment-timezone'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

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
  bold: {
    fontWeight: 'bold'
  },
  button: {
    float: 'right'
  },
})

class AdminLesson extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lessons: [],
      teachers: [],
      columns: [
        { title: 'Nom', field: 'name' },
        { title: 'Type de date', field: 'dateType' },
        { title: 'Jour', field: 'day' },
        { title: 'Date de début', field: 'begin' },
        { title: 'Date de fin', field: 'end' },
        { title: 'Heure', field: 'hour' },
        { title: 'Nombre de cours', field: 'lessonsCount' },
        { title: 'Places restantes', field: 'spotLeft' },
        { title: 'Places disponibles', field: 'spotTotal' },
        { title: 'Status', field: 'status' },
      ],
      rows: [],
      openLessonDialog: false,
      openInfosDialog: false,
      editLessonDialog: false,
      deleteLessonDialog: false,
      openMessageDialog: false,
      message: '',
      loading: true,
      selectedLesson:  null,
      selectedIndex: null,
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
      page: 0,
      rowsPerPage: 5
    }
  }

  componentDidMount() {
    this.props.client.watchQuery({
      query: GET_LESSONS_WAITING_OR_GOING_FULL,
      fetchPolicy: 'cache-and-network'
    })
    .subscribe(({data, loading, error }) => {
      if(error){
        console.log(error)
        this.setState({ loading: false})
        this.showSnackMessage('Erreur durant le chargement de vos données', 'error')
      }else if(data){
        var lRows = []
        var lessons = data.lessonsWaitingOrGoing
        lessons.forEach((lesson , index) => {
          lesson.lessonsDay = this.sortLessonsDay(lesson.lessonsDay)
          lRows.push({
            name: lesson.name,
            dateType: lesson.dateType,
            day: dateToDayString(lesson.recurenceBegin),
            begin: moment(lesson.recurenceBegin).format('DD/MM/YYYY'),
            end: moment(lesson.recurenceEnd).format('DD/MM/YYYY'),
            hour: moment(lesson.recurenceBegin).format('HH:mm')+' à '+moment(lesson.recurenceEnd).format('HH:mm'),
            lessonsCount: lesson.totalLessons,
            spotLeft: lesson.spotLeft,
            spotTotal: lesson.spotTotal,
            status: lesson.status,
            lesson: lesson
          })
        });
        var sortedLessons = this.sortLessons(lRows)
        this.setState({ rows: sortedLessons, loading: false })
      }
    })

    this.props.client.query({
      query: GET_TEACHERS
    })
    .then(result => {
      this.setState({ teachers: result.data.teachers })
    })
    .catch(error => {
      console.log(error)
      this.showSnackMessage('Erreur durant le chargement des professeurs', 'error')
    })
    
  }

  exportToXslx = async () => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Olmavita';
    workbook.lastModifiedBy = 'Olmavita';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    const monday = workbook.addWorksheet('Lundi');
    const tuesday = workbook.addWorksheet('Mardi');
    const wednesday = workbook.addWorksheet('Mercredi');
    const thursday = workbook.addWorksheet('Jeudi');
    const friday = workbook.addWorksheet('Vendredi');
    const saturday = workbook.addWorksheet('Samedi');
    const sunday = workbook.addWorksheet('Dimanche');
    const worksheets = [monday, tuesday, wednesday, thursday, friday, saturday, sunday];
    workbook.worksheets.forEach(e => {
      e.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Nom', key: 'name', width: 25 },
        { header: 'Heure', key: 'hour', width: 15 },
        { header: 'Professeur', key: 'teacher', width: 15 },
        { header: 'Places disponibles', key: 'spotLeft', width: 25 },
        { header: 'Places totales', key: 'spotTotal', width: 10 },
        { header: 'Abonnés', key: 'user', width: 25 },
        { header: 'Emails', key: 'email', width: 40 }
      ]
    })

    this.state.rows.forEach(e => {
      var date = moment(e.lesson.recurenceBegin)
      var index = date.weekday()
      console.log(e.lesson.recurenceBegin)
      console.log(index)
      workbook.worksheets[index].addRow({
        id: e.lesson.id,
        name: e.name,
        hour: e.hour,
        teacher: e.teacher,
        spotLeft:e.spotLeft,
        spotTotal: e.spotTotal,
        user: '',
        email: ''
      })
      e.lesson.users.forEach(user => {
        workbook.worksheets[index].addRow({
          id: '',
          name: '',
          hour: '',
          teacher: '',
          spotLeft: '',
          spotTotal: '',
          user: user.firstName+' '+user.lastName,
          email: user.email
        })
      })
      workbook.worksheets[index].addRow({
        id: '',
        name: '',
        hour: '',
        teacher: '',
        spotLeft: '',
        spotTotal: '',
        user: '',
        email: ''
      })
    })
    //const file = await workbook.xlsx.writeFile('Aquadream_Présences.xlsx')
    workbook.xlsx.writeBuffer()
    .then(buffer => FileSaver.saveAs(new Blob([buffer]), `${moment().format('DD-MM-YYYY').toString()}_aquadream_cours.xlsx`))
    .catch(err => console.log('Error writing excel export', err))
    //window.open(file)
  }

  handleOpenLessonDialog = (lesson, index) => {
    this.setState({ 
      openLessonDialog: true,
      selectedLesson: lesson,
      selectedIndex: index
    })
  }

  handleInfosDialog = (lesson) => {
    if(!this.state.openInfosDialog) {
      this.setState({
        openInfosDialog: true,
        selectedLesson: lesson,
      })
    }else{
      this.setState({
        openInfosDialog: false
      })
    }
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
          query: GET_LESSONS_WAITING_OR_GOING_FULL
        },
        {
          query: GET_LESSONS
        }
      ]
    })
    .then(result =>  {
      var lessons = this.state.rows
      lessons[this.state.selectedIndex] = result.data.openLesson
      this.showSnackMessage('Le cours a bien été ouvert !', 'success')
      this.setState({
        openLessonDialog: false,
        loading: false,
        rows: lessons
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

  openEditDialog = (lesson, index) => {
    this.setState({ 
      selectedLesson: lesson,
      selectedIndex: index,
      editLessonDialog: true
    })
  }

  closeDialog = () => {
    this.setState({ 
      editLessonDialog: false,
      deleteLessonDialog: false
    })
  }

  openDeleteDialog = (lesson, index) => {
    this.setState({ 
      selectedLesson: lesson,
      selectedIndex: index,
      deleteLessonDialog: true
    })
  }

  handleEmailDialog = (lesson) => {
    if(this.state.openMessageDialog) {
      this.setState({ 
        openMessageDialog: false,
        loading: true
      })
      this.sendEmail()
    }else{
      this.setState({ 
        openMessageDialog: true,
        selectedLesson: lesson 
      })
    }
  }

  handleChangePage = (event, newPage) => {
    this.setState({
      page: newPage
    })
  };
/*
  handleChangeRowsPerPage = event => {
    this.setState({
      rowsPerPage: parseInt(event.target.value, 10)
    })
  };
*/

  handleClose = () => {
    this.setState({ editLessonDialog: false })
  }


  handleButtonConfirm = () => {
    if(!this.state.loading) {
      this.setState({
        loading: true,
      })
      this.props.client.mutate({
        mutation: UPDATE_LESSON,
        variables: {
          id: this.state.selectedLesson.id,
          name: this.state.selectedLesson.name,
          comment: this.state.selectedLesson.comment,
          spotLeft: this.state.selectedLesson.spotLeft,
          spotTotal: this.state.selectedLesson.spotTotal,
          pricing: {
            unitPrice: this.state.selectedLesson.pricing.unitPrice,
            unitPrice2X: this.state.selectedLesson.pricing.unitPrice2X,
            unitPrice3X: this.state.selectedLesson.pricing.unitPrice3X,
            monthlyPrice: this.state.selectedLesson.pricing.monthlyPrice,
            monthlyPrice2X: this.state.selectedLesson.pricing.monthlyPrice2X,
            monthlyPrice3X: this.state.selectedLesson.pricing.monthlyPrice3X,
            totalPrice: this.state.selectedLesson.pricing.totalPrice,
            totalPrice2X: this.state.selectedLesson.pricing.totalPrice2X,
            totalPrice3X: this.state.selectedLesson.pricing.totalPrice3X
          },
          recurenceBegin: this.state.selectedLesson.recurenceBegin,
          recurenceEnd: this.state.selectedLesson.recurenceEnd,
          teacher: this.state.selectedLesson.teacher.id
        },
        refetchQueries: [
          {
            query: GET_LESSONS_WAITING_OR_GOING_FULL
          },
          {
            query: GET_LESSONS
          }
        ]
      })
      .then(result => {
        this.setState({ 
          editLessonDialog: false,
          loading: false,
          selectedLesson: result.data.updateLesson
         })
        this.showSnackMessage('Votre cours a bien été modifié', 'success')
      })
      .catch(error => {
        console.log(error)
        this.setState({ 
          editLessonDialog: false,
          loading: false 
        })
        this.showSnackMessage('Erreur lors de la modification du cours', 'error')
      })
    }
  }

  sendEmail = () => {
    this.setState({ 
      loading: true
    })
    var users = []
    for(const user of this.state.selectedLesson.users) {
      users.push(user.id)
    }
    this.props.client.query({
      query: SEND_MULTI_EMAIL,
      variables: {
        users: users,
        message: this.state.message
      }
    })
    .then(result => {
      this.setState({
        loading: false
      })
      this.showSnackMessage('Les emails ont été envoyés', 'success')
    })
    .catch(error => {
      this.setState({
        loading: false
      })
      this.showSnackMessage('Erreur lors de l\'envoi des emails', 'error')
    })
  }

  deleteLesson = () => {
    this.props.client.mutate({
      mutation: DELETE_LESSON,
      variables: {
        id: this.state.selectedLesson.id
      },
      refetchQueries: [
        {
          query: GET_LESSONS_WAITING_OR_GOING_FULL
        },
        {
          query: GET_LESSONS
        }
      ]
    })
    .then(result => {
      this.setState({
        deleteLessonDialog: false,
        loading: false,
      })
      this.showSnackMessage('Le cours a bien été supprimé', 'success')
    })
    .catch(error => {
      console.log(error)
      this.showSnackMessage('Erreur lors de la supression du cours', 'error')
    })
  }

  render() {
    const { classes } = this.props
    return(
      <div>
      <Button className={classes.button} color="primary" disabled={this.state.loading} onClick={() => {this.exportToXslx()}}>Liste des cours</Button>
      {this.state.loading ? (<CircularProgress size={150} className={classes.buttonProgress} />):( 
      <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <MaterialTable
          title='Liste des cours'
          columns={this.state.columns}
          data={this.state.rows}
          actions={[
            {
              icon: () => <Edit />,
              tooltip: 'Editer le cours',
              onClick: (event, rowData) => this.openEditDialog(rowData.lesson, rowData.tableData.id)
            },
            rowData => ({
              icon: () => <MeetingRoom />,
              tooltip: 'Ouvrir le cours',
              onClick: (event, rowData) => this.handleOpenLessonDialog(rowData.lesson, rowData.tableData.id),
              disabled: rowData.lesson.isOpened
            }),
            rowData => ({
              icon: () => <Delete />,
              tooltip: 'Supprimer le cours',
              onClick: (event, rowData) => this.openDeleteDialog(rowData.lesson, rowData.tableData.id),
              disabled: rowData.lesson.users.length !== 0
            }),
            {
              icon: () => <Info />,
              tooltip: 'Informations',
              onClick: (event, rowData) => this.handleInfosDialog(rowData.lesson)
            },
            {
              icon: () => <Email />,
              tooltip: 'Envoyer un email',
              onClick: (event, rowData) => this.handleEmailDialog(rowData.lesson)
            }
          ]}
          options={{
            filtering: true
          }}
        />
      </Container>
      )}
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
      <Dialog
        open={this.state.openInfosDialog}
        maxWidth='md'
      >
        <DialogTitle>Informations détaillées</DialogTitle>
        <DialogContent>
        <Container component="main" maxWidth="xl" className={classes.container}>
          {this.state.selectedLesson !== null && (
          <Grid container spacing={2}>
            <Grid item xs={3} sm={3}>
              <Typography className={classes.bold}>
                Addresse:
              </Typography>
            </Grid>
            <Grid item xs={9} sm={9}>
              <Typography>
                {this.state.selectedLesson.address.street} {this.state.selectedLesson.address.postalCode} {this.state.selectedLesson.address.city} 
              </Typography>
                      </Grid>
                      <Grid item xs={3} sm={3}>
                        <Typography className={classes.bold}>
                          Type de cours:
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sm={3}>
                        <Typography>
                          {this.state.selectedLesson.lessonType.simpleName} 
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sm={3}>
                        <Typography className={classes.bold}>
                          Sous titre:
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sm={3}>
                        <Typography>
                          {this.state.selectedLesson.lessonSubType.simpleName} 
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix unitaire:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.unitPrice}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix mensuel:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.monthlyPrice}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix total:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.totalPrice}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix unitaire 2X:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.unitPrice2X}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix mensuel 2X:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.monthlyPrice2X}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix total 2X:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.totalPrice2X}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix unitaire 3X:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.unitPrice3X}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix mensuel 3X:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.monthlyPrice3X}€
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography className={classes.bold}>
                          Prix total 3X:
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Typography>
                          {this.state.selectedLesson.pricing.totalPrice3X}€
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
                      {this.state.selectedLesson.lessonsDay.map((lessonDay, index) => (
                        <Fragment key={index}>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                          <Typography>
                              {this.state.selectedLesson.teacher.user.firstName} {this.state.selectedLesson.teacher.user.lastName}
                          </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {moment(lessonDay.dayDate).format('DD/MM/YYYY')}
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {moment(this.state.selectedLesson.recurenceBegin).format('HH:mm')} à {moment(this.state.selectedLesson.recurenceEnd).format('HH:mm')} 
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {lessonDay.spotLeft}
                            </Typography>
                          </Grid>
                          <Grid item className={classes.textCentered} xs={2} md={2} >
                            <Typography>
                              {lessonDay.spotTotal}  
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
          )}
                  </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleInfosDialog.bind(this)} color="default" disabled={this.state.loading}>
            Retour          
          </Button>
        </DialogActions>
      </Dialog>
        <Dialog
          open={this.state.deleteLessonDialog}
        >
          <DialogTitle>Supprimer le cours</DialogTitle>
          <DialogContent>
            <DialogContentText>Êtes-vous sûr de vouloir supprimer ce cours ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDialog.bind(this)} color="default" disabled={this.state.loading}>
              Annuler           
            </Button>
            <Button onClick={this.deleteLesson.bind(this)} color="primary" disabled={this.state.loading}>
              Confirmer           
            </Button> 
          </DialogActions>
        </Dialog>
      <Dialog open={this.state.editLessonDialog}>
        <DialogTitle>Modifier le cours</DialogTitle>
        <DialogContent>
          <Container component="main" maxWidth="xl" className={classes.container}>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={6}>
                <TextField
                  autoFocus
                  id="name"
                  label="Nom"
                  type="text"
                  value={this.state.selectedLesson ? this.state.selectedLesson.name : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.name = event.target.value
                    this.setState({ selectedLesson: selectedLesson })
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <TextField
                  autoFocus
                  id="comment"
                  label="Infos"
                  type="text"
                  value={this.state.selectedLesson ? this.state.selectedLesson.comment : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.comment = event.target.value
                    this.setState({ selectedLesson: selectedLesson })
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <TextField
                  autoFocus
                  id="spotLeft"
                  label="Places Restantes"
                  type="number"
                  value={this.state.selectedLesson ? this.state.selectedLesson.spotLeft : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.spotLeft = Number(event.target.value)
                    this.setState({ selectedLesson: selectedLesson })
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <TextField
                  autoFocus
                  id="spotTotal"
                  label="Places Totales"
                  type="number"
                  value={this.state.selectedLesson ? this.state.selectedLesson.spotTotal : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.spotTotal = Number(event.target.value)
                    this.setState({ selectedLesson: selectedLesson })
                  }}
                  />
              </Grid>
              <Grid item xs={4} md={4}>
                <TextField
                  autoFocus
                  id="unitPrice"
                  label="Prix Unitaire"
                  type="number"
                  value={this.state.selectedLesson ? this.state.selectedLesson.pricing.unitPrice : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.pricing.unitPrice = Number(event.target.value)
                    selectedLesson.pricing.totalPrice = selectedLesson.pricing.unitPrice * selectedLesson.totalLessons
                    selectedLesson.pricing.monthlyPrice = Math.ceil(selectedLesson.pricing.totalPrice / selectedLesson.totalMonth)
                    this.setState({ selectedLesson: selectedLesson })
                  }}

                />
              </Grid>
              <Grid item xs={4} md={4}>
                <TextField
                  autoFocus
                  id="unitPrice2X"
                  label="Prix Unitaire 2X"
                  type="number"
                  value={this.state.selectedLesson ? this.state.selectedLesson.pricing.unitPrice2X : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.pricing.unitPrice2X = Number(event.target.value)
                    selectedLesson.pricing.totalPrice2X = selectedLesson.pricing.unitPrice2X * selectedLesson.totalLessons
                    selectedLesson.pricing.monthlyPrice2X = Math.ceil(selectedLesson.pricing.totalPrice2X / selectedLesson.totalMonth)
                    this.setState({ selectedLesson: selectedLesson })
                  }}
                />
              </Grid>
              <Grid item xs={4} md={4}>
                <TextField
                  autoFocus
                  id="unitPrice3X"
                  label="Prix Unitaire 3X"
                  type="number"
                  value={this.state.selectedLesson ? this.state.selectedLesson.pricing.unitPrice3X : ''}
                  onChange={event => {
                    var selectedLesson = this.state.selectedLesson 
                    selectedLesson.pricing.unitPrice3X = Number(event.target.value)
                    selectedLesson.pricing.totalPrice3X = selectedLesson.pricing.unitPrice3X * selectedLesson.totalLessons
                    selectedLesson.pricing.monthlyPrice3X = Math.ceil(selectedLesson.pricing.totalPrice3X / selectedLesson.totalMonth)
                    this.setState({ selectedLesson: selectedLesson })
                  }}
                />
              </Grid>
              <Grid item xs={4} md={4}>
                  <KeyboardTimePicker
                    required
                    name="recurenceBegin"
                    margin="normal"
                    id="timeBegin"
                    label="Heure de début"
                    ampm={false}
                    value={this.state.selectedLesson ? moment(this.state.selectedLesson.recurenceBegin): moment()}
                    KeyboardButtonProps={{
                      'aria-label': 'Sélectionner Heure'
                    }}
                    onChange={event => {
                      var selectedLesson = this.state.selectedLesson
                      var time = moment(event)
                      selectedLesson.recurenceBegin = moment(selectedLesson.recurenceBegin).hour(time.hour()).minute(time.minute()).toISOString(true)
                      this.setState({ selectedLesson: selectedLesson }) 
                    }}
                  />
              </Grid>
              <Grid item xs={4} md={4}>
                  <KeyboardTimePicker
                    required
                    name="recurenceEnd"
                    margin="normal"
                    id="timeEnd"
                    label="Heure de fin"
                    ampm={false}
                    value={this.state.selectedLesson ? moment(this.state.selectedLesson.recurenceEnd): moment()}
                    KeyboardButtonProps={{
                      'aria-label': 'Sélectionner Heure'
                    }}
                    onChange={event => {
                      var selectedLesson = this.state.selectedLesson
                      var time = moment(event)
                      selectedLesson.recurenceEnd = moment(selectedLesson.recurenceEnd).hour(time.hour()).minute(time.minute()).toISOString(true)
                      this.setState({ selectedLesson: selectedLesson }) 
                    }}
                  />
              </Grid>
              <Grid item xs={4} md={4} />
              <Grid item xs={6} md={6}>
              <FormControl required variant="outlined" className={classes.formControl}>
                <InputLabel id="lessonType">Professeur</InputLabel>
                  <Select
                    labelId="teacher"
                    id="teacher"
                    value={this.state.selectedLesson ? this.state.selectedLesson.teacher  : null}
                    name="teacher"
                    label="Professeur"
                    labelWidth={80}
                    onChange={event => {
                      var selectedLesson = this.state.selectedLesson
                      selectedLesson.teacher = event.target.value
                      this.setState({ selectedLesson: selectedLesson })
                    }}
                  >
                    <MenuItem value={this.state.selectedLesson ? this.state.selectedLesson.teacher : '' } disabled>
                      {this.state.selectedLesson ? (this.state.selectedLesson.teacher.user.firstName+' '+this.state.selectedLesson.teacher.user.lastName) : ''}
                    </MenuItem>
                    {this.state.teachers.map(teacher =>               
                      <MenuItem key={teacher.id} value={teacher}>{teacher.user.firstName} {teacher.user.lastName}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </ MuiPickersUtilsProvider>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeDialog.bind(this)} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={this.handleButtonConfirm.bind(this)} color="primary" disabled={this.state.loading}>
            Confirmer           
          </Button>  
        </DialogActions>
      </Dialog>
      <Dialog open={this.state.openMessageDialog} fullWidth={true} maxWidth='md'>
        <DialogTitle>Envoyer un message</DialogTitle>
        <DialogContent>
          <DialogContentText>Ce message sera envoyé à tous les abonnés à ce cours</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Message"
            type="text"
            multiline
            rows={5}
            fullWidth
            value={this.state.message}
            onChange={ event =>  {this.setState({ message: event.target.value })}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {this.setState({ openEmail: false })}} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={() => this.handleEmailDialog(null)} color="primary" disabled={this.state.loading}>
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