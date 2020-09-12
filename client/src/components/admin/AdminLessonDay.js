import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useApolloClient } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import MaterialTable from 'material-table'
import { TablePagination, CircularProgress, Button, Tooltip, Container, CssBaseline, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core'
import { ExpandMore, Delete, Edit, PeopleAlt } from '@material-ui/icons'
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { GET_LESSONS_DAY_FROM_TODAY } from '../../database/query/lessonDayQuery'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { UPDATE_LESSON_DAY, CANCEL_LESSON_DAY } from '../../database/mutation/lessonDayMutation'
import { dateToDayString } from '../../utils/dateTimeConverter'
import DateFnsUtils from '@date-io/date-fns'
import moment from 'moment-timezone'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

const styles = makeStyles(theme => ({
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
}))

export default function AdminLessonDay(){
  const classes = styles()
  const [today,] = React.useState(moment().toISOString(true))
  const [client,] = React.useState(useApolloClient())
  const [teachers, setTeachers] = React.useState([])
  const [columns,] = React.useState(
    [
      { title: 'ID', field: 'id' },
      { title: 'Nom', field: 'name' },
      { title: 'Jour', field: 'day' },
      { title: 'Heure', field: 'hour' },
      { title: 'Professeur', field: 'teacher' },
      { title: 'Places disponibles abonnement', field: 'spotLeft' },
      { title: 'Places disponibles crédit', field: 'spotCanceled' },
      { title: 'Places totales', field: 'spotTotal' },
      { title: 'Status', field: 'status' },
    ]
  )
  const [rows, setRows] = React.useState([])
  const [rowsToShow, setRowsToShow] = React.useState([])
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [openSnack, setOpenSnack] = React.useState(false)
  const [openInfosDialog, setOpenInfosDialog] = React.useState(false)
  const [openEditDialog, setOpenEditDialog] = React.useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
  const [selectedLessonDay, setSelectedLessonDay] = React.useState(null)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [message, setMessage] = React.useState('')
  const [dialogLoading, setDialogLoading] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage,] = React.useState(50)
  
  const { loading, error, data, fetchMore } = useQuery(
    GET_LESSONS_DAY_FROM_TODAY,
    {
      fetchPolicy: 'cache-and-network',
      variables: { 
        today: today,
        offset: 0,
        limit: 200
      },
      onCompleted: (newData) => { 
        var lRows = []
        for(const lessonDay of newData.lessonsDayFromToday) {
          lRows.push({
            id: lessonDay.id,
            name: lessonDay.lesson.name,
            day: dateToDayString(lessonDay.dayDate),
            date: moment(lessonDay.dayDate).format('DD/MM/YYYY'),
            hour: moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')+' à '+moment(lessonDay.hour.end, 'HH:mm').format('HH:mm'),
            teacher: lessonDay.teacher.user.firstName+' '+lessonDay.teacher.user.lastName,
            spotLeft:lessonDay.spotLeft,
            spotCanceled: lessonDay.spotCanceled,
            spotTotal: lessonDay.spotTotal,
            status: lessonDay.isCanceled ? 'Annulé' : 'Planifié',
            lessonDay: lessonDay
          })
        }
        setRows(lRows)
        setRowsToShow(lRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))

      }
    }
  )
  
  const { loadTeacher, errorTeacher, dataTeacher } = useQuery(
    GET_TEACHERS,
  {
    fetchPolicy: 'cache-and-network',
    onCompleted: (newData) => { setTeachers(newData.teachers) }
  })
  
  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }
  
  const handleSnackClose = () => {
    setOpenSnack(false)
  }

  const handleDialogChange = (event) => {
    var lessonDay = {...selectedLessonDay}
    switch(event.target.name) {
      case 'teacher':
        lessonDay.teacher.id = event.target.value
        setSelectedLessonDay(lessonDay)
        return
      case 'spotTotal':
        lessonDay.spotTotal = Number(event.target.value)
        setSelectedLessonDay(lessonDay)
        return
      case 'spotLeft':
        lessonDay.spotLeft = Number(event.target.value)
        setSelectedLessonDay(lessonDay)
        return
      case 'message':
        setMessage(event.target.value)
        return
      default:
       console.log('UNEXCEPTED BEHAVIOR')
        break
    }
  }

  const handleDialogDateChange = (event, id) => {
    var lessonDay = {...selectedLessonDay}
    switch(id) {
      case 'begin':
        lessonDay.hour.begin = moment(event).format('HH:mm')
        console.log(lessonDay.hour)
        setSelectedLessonDay(lessonDay)
        return
      case 'end':
        lessonDay.hour.end = moment(event).format('HH:mm')
        setSelectedLessonDay(lessonDay)
        return
    }
  }
/*
  const sortLessonsDay = (lessonsDay) => {
    return lessonsDay.sort((a, b) => Date.parse(a.dayDate) - Date.parse(b.dayDate))
  }
*/

  const handleChangePage = (event, newPage) => {
    if(newPage > page) {
      fetchMore({
        variables: { 
          today: today,
          offset: data.lessonsDayFromToday.length
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if(!fetchMoreResult) return prev
          return Object.assign({}, prev, { 
            lessonsDayFromToday: [...prev.lessonsDayFromToday, ...fetchMoreResult.lessonsDayFromToday]
          })
        }
      })
    }
    setPage(newPage)
    setRowsToShow(rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))
    
  };

  const handleInfosDialog = (lessonDay) => {
    setSelectedLessonDay(lessonDay)
    setOpenInfosDialog(true)
  }

  const closeInfosDialog = () => {
    setOpenInfosDialog(false)
  }

  const handleEditDialog = (lessonDay) => {
    setSelectedLessonDay(lessonDay)
    setOpenEditDialog(true)
  }

  const closeEditDialog = () => {
    setOpenEditDialog(false)
  }

  const handleDeleteDialog = (lessonDay, index) => {
    setSelectedLessonDay(lessonDay)
    setSelectedIndex(index)
    setOpenDeleteDialog(true)
  }

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false)
  }

  const modifyLessonDay = () => {
    setDialogLoading(true)
    var lessonDay = selectedLessonDay
    var users = selectedLessonDay.users
    var tmp = []
    users.forEach(element => {
      tmp.push(element.id)
    });
    lessonDay.users = tmp
    
    client.mutate({
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
      },
      refetchQueries: [
        {
          query: GET_LESSONS_DAY_FROM_TODAY
        },
      ]
    })
    .then(result => {
      closeEditDialog()
      setDialogLoading(false)
      showSnackMessage('Le cours a bien été modifié', 'success')
    })
    .catch(error => {
      closeEditDialog()
      setDialogLoading(false)
      showSnackMessage('Une erreur est survenue durant la modification', 'error')
    })
  }

  const deleteLessonDay = () => {
    setDialogLoading(true)
    var lessonDay = selectedLessonDay
    var users = selectedLessonDay.users
    var tmp = []
    users.forEach(element => {
      tmp.push({ id: element.id, firstName: element.firstName, lastName: element.lastName, email: element.email })
    });
    lessonDay.users = tmp

    client.mutate({
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
        message: message
      },
    })
    .then(result => {
      var cLessonsDay = {...rows}
      cLessonsDay[selectedIndex].status = true
      setRows(cLessonsDay)
      setMessage('')
      closeDeleteDialog()
      setDialogLoading(false)
      showSnackMessage('Le cours a bien été annulé', 'success')
    })
    .catch(error => {
      console.log(error)
      closeDeleteDialog()
      setDialogLoading(false)
      showSnackMessage('Une erreur est survenue durant la modification', 'error')
    })
  }

    if(loading || dialogLoading) {
      return <CircularProgress size={150} className={classes.buttonProgress} />
    }
    if(error){
      return <p>ERROR</p>
    }
    return(
      <div>
        <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <MaterialTable
          title="Liste des cours quotidiens"
          columns={columns}
          data={rowsToShow}
          actions={[
            {
              icon: () => <Edit />,
              tooltip: 'Modifier le cours',
              onClick: (event, rowData) => handleEditDialog(rowData.lessonDay, rowData.tableData.id)
            },
            rowData => ({
              icon: () => <Delete />,
              tooltip: 'Annuler le cours',
              onClick: (event, rowData) => handleDeleteDialog(rowData.lessonDay, rowData.tableData.id),
              disabled: rowData.lessonDay.isCanceled
            }),
            {
              icon: () => <PeopleAlt />,
              tooltip: 'Informations sur les élèves',
              onClick: (event, rowData) => handleInfosDialog(rowData.lessonDay)
            }
          ]}
          components={{
            Pagination: props => (
              <TablePagination
                {...props}
                rowsPerPageOptions={[rowsPerPage, { label: 'All', value: -1 }]}
                component="div"
                colSpan={3}
                count= {rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                //onChangeRowsPerPage={handleChangeRowsPerPage}
                //ActionsComponent={TablePaginationActions}
              />
          )}}
          options={{
            filtering: true,
            pageSize:50
          }}
        />
        </Container>
        {selectedLessonDay && (
        <Dialog open={openEditDialog}>
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
                  value={selectedLessonDay.lesson.name}
                  disabled
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <FormControl required className={classes.formControl}>
                  <InputLabel id="lessonTeacher">Professeur</InputLabel>
                  <Select
                    labelId="teacher"
                    id="teacher"
                    value={selectedLessonDay.teacher.id}
                    name="teacher"
                    label="Professeur"
                    onChange={event => handleDialogChange(event)}
                  >
                    <MenuItem disabled>
                    {selectedLessonDay ? (selectedLessonDay.teacher.user.firstName+' '+selectedLessonDay.teacher.user.lastName) : ''}
                    </MenuItem>
                    {teachers.map(teacher =>               
                      <MenuItem key={teacher.id} value={teacher.id}>{teacher.user.firstName} {teacher.user.lastName}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid item xs={6} md={6}>
                <KeyboardTimePicker
                  required
                  name="begin"
                  margin="normal"
                  id="begin"
                  label="Heure de début"
                  ampm={false}
                  value={moment(selectedLessonDay.hour.begin, 'HH:mm')}
                  onChange={event => handleDialogDateChange(event , 'begin')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner Heure'
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
              <KeyboardTimePicker
                  required
                  name="end"
                  margin="normal"
                  id="end"
                  label="Heure de fin"
                  ampm={false}
                  value={moment(selectedLessonDay.hour.end, 'HH:mm')}
                  onChange={event => handleDialogDateChange(event, 'end')}
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
                  type="number"
                  value={selectedLessonDay.spotLeft}
                  onChange={event => handleDialogChange(event)}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <TextField
                  required
                  name="spotTotal"
                  id="spotTotal"
                  label="Places totales"
                  type="number"
                  value={selectedLessonDay ? selectedLessonDay.spotTotal : 0}
                  onChange={event => handleDialogChange(event)}
                />
              </Grid>
            </Grid>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog}>
              Annuler 
            </Button>
            <Button color="primary" onClick={modifyLessonDay}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
        )}
        <Dialog open={openDeleteDialog}>
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
              value={message}
              onChange={event => handleDialogChange(event)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>
              Annuler 
            </Button>
            <Button color="primary" onClick={deleteLessonDay}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
        {selectedLessonDay && (
          <Dialog open={openInfosDialog}>
            <DialogTitle>Informations sur les élèves</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {selectedLessonDay.users.map((user, index) => (
                  <Grid item xs={12} md={12} key={user.id+' '+selectedLessonDay.id}>
                    <Typography>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeInfosDialog}>
                Annuler 
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={openSnack}
          autoHideDuration={5000}
          onClose={handleSnackClose}
        >
          <CustomSnackBar
            onClose={handleSnackClose}
            variant={errorVariant}
            message={errorMessage}
          />
        </Snackbar>
      </div>
    )
  }
//export default withApollo(withRouter(withStyles(styles)(AdminLessonDay)))