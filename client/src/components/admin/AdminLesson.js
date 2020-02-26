import React, { Fragment } from 'react'
import PropTypes from 'prop-types';
import { withStyles, useTheme, makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { TextField, TablePagination, TableFooter, CircularProgress, Tooltip, Button, DialogTitle, Dialog, DialogContent, DialogContentText, DialogActions, Container, CssBaseline, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid } from '@material-ui/core'
import { MeetingRoom, ExpandMore, Edit, FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { GET_LESSONS_WAITING_OR_GOING_FULL, GET_LESSONS } from '../../database/query/lessonQuery'
import { OPEN_LESSON, UPDATE_LESSON } from '../../database/mutation/lessonMutation'
import { dateToDayString } from '../../utils/dateTimeConverter'
import DateFnsUtils from '@date-io/date-fns'
import frLocale from "date-fns/locale/fr";
import moment from 'moment'

moment.locale('fr')

const styles2 = makeStyles(theme => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}))

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

function TablePaginationActions(props) {

  const theme = useTheme();
  const classes = styles2()
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = event => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = event => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = event => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

class AdminLesson extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lessons: [],
      openLessonDialog: false,
      editLessonDialog: false,
      loading: true,
      selectedLesson:  null,
      selectedIndex: null,
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
        this.setState({ loading: false})
        this.showSnackMessage('Erreur durant le chargement de vos données', 'error')
      }else{
        var lessons = data.lessonsWaitingOrGoing
        lessons.forEach((element, index) => {
          lessons[index].lessonsDay = this.sortLessonsDay(element.lessonsDay)
        });
        var sortedLessons = this.sortLessons(lessons)
        this.setState({ lessons: sortedLessons, loading: false })
      }
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
          query: GET_LESSONS_WAITING_OR_GOING_FULL
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

  openEditDialog = (lesson, index) => {
    console.log(lesson)
    this.setState({ 
      selectedLesson: lesson,
      selectedIndex: index,
      editLessonDialog: true
    })
  }

  closeEditDialog = () => {
    this.setState({ 
      editLessonDialog: false
    })
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
          recurenceEnd: this.state.selectedLesson.recurenceEnd
        }
      })
      .then(result => {
        console.log(result)
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

  render() {
    const { classes } = this.props
    return(
      <div>
      {this.state.loading ? (<CircularProgress size={150} className={classes.buttonProgress} />):( 
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
          {(this.state.rowsPerPage > 0
            ? this.state.lessons.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
            : this.state.lessons
          ).map((lesson, index) => (
            <Fragment key={lesson.id}>
              <TableRow key={lesson.id} className={classes.row}>
                <TableCell component="th" scope="row">{lesson.name}</TableCell> 
                <TableCell>{lesson.dateType}</TableCell>
                <TableCell>{dateToDayString(lesson.recurenceBegin)}</TableCell>
                <TableCell>{moment(lesson.recurenceBegin).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{moment(lesson.recurenceEnd).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{moment(lesson.recurenceBegin).format('HH:mm')} à {moment(lesson.recurenceEnd).format('HH:mm')}</TableCell>
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
                <Tooltip title="Editer le cours">
                  <IconButton onClick={this.openEditDialog.bind(this, lesson, index)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
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
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, { label: 'All', value: -1 }]}
                colSpan={3}
                count={this.state.lessons.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={this.handleChangePage}
                //onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
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
            </Grid>
          </ MuiPickersUtilsProvider>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose.bind(this)} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={this.handleButtonConfirm.bind(this)} color="primary" disabled={this.state.loading}>
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