import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import { Container, Button, Typography, CssBaseline, Table, TableHead, TableCell, Tooltip, IconButton, TableRow, TableBody, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { GET_LESSONS_DAY_SPOT_CANCELED } from '../../database/query/lessonDayQuery'
import { GET_CREDITS_FOR_USER } from '../../database/query/creditQuery'
import { USE_CREDIT } from '../../database/mutation/creditMutation'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { Save } from '@material-ui/icons'
import { dateToDayString } from '../../utils/dateTimeConverter'
import moment from 'moment'

moment.locale('fr')

const styles = theme => ({
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
    marginTop: 35,
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
  }
})

class Credit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      credit: this.props.location.state.credit,
      lessonsDay: [],
      selectedLessonDay: null,
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
      openConfirmDialog: false,
    }
  }

  componentDidMount() {
    this.props.client.query({
      query: GET_LESSONS_DAY_SPOT_CANCELED
    })
    .then(result => {
      var lessonsDay = []
      result.data.lessonsDaySpotCanceled.forEach(element => {
        if(element.lesson.lessonType === this.state.credit.lesson_day.lesson.lessonType && element.lesson.lessonSubType === this.state.credit.lesson_day.lesson.lessonSubType) {
          lessonsDay.push(element)
        }
      });

      this.setState({
        lessonsDay: lessonsDay
      })
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la récupération des cours disponibles', 'error')
    })
  }

  useCredit = () => {
    var lessonDay = this.state.selectedLessonDay
    var credit = this.state.credit
    var user = this.props.client.readQuery({query: GET_AUTHENTIFICATION}).Authentification
    this.props.client.mutate({
      mutation: USE_CREDIT,
      variables: {
        credit: credit.id,
        lessonDay: lessonDay.id,
        user: user.userID
      },
      refetchQueries: [
        {
          query: GET_LESSONS_DAY_SPOT_CANCELED,
        },
        {
          query: GET_CREDITS_FOR_USER,
          variables: {
            userID: credit.user.id
          }
        }
      ]
    })
    .then(result => {
      console.log(result)
      this.props.history.push('/home')
    })
    .catch(error => {
      console.log(error)
      this.showSnackMessage('Erreur lors de la confirmation.', 'error')
    })
  }

  openConfirmDialog = (lessonDay) => {
    this.setState({
      selectedLessonDay: lessonDay,
      openConfirmDialog: true
    })
  }

  closeConfirmDialog = () => {
    this.setState({
      openConfirmDialog: false
    })
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
    const { classes } = this.props
    return(
      <div>
      <Container component="main" maxWidth="xl">
      <CssBaseline />
      <Typography component="h1" variant="h5" className={classes.title}>
        Cours disponibles:
      </Typography>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{width: '15%'}}>Nom</TableCell>
              <TableCell>Jour</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Professeur</TableCell>
              <TableCell>Places disponibles</TableCell>
              <TableCell style={{width: '10%'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.lessonsDay.map((lessonDay) => (
              <TableRow className={classes.row} key={lessonDay.id}>
                <TableCell component="th" scope="row">{lessonDay.lesson.name}</TableCell>
                <TableCell>{dateToDayString(lessonDay.dayDate)}</TableCell>
                <TableCell>{moment(lessonDay.dayDate).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')} à {moment(lessonDay.hour.end, 'HH:mm').format('HH:mm')}</TableCell>
                <TableCell>{lessonDay.teacher.user.firstName} {lessonDay.teacher.user.lastName}</TableCell>
                <TableCell>{lessonDay.spotCanceled}</TableCell>
                <TableCell>
                  <Tooltip title="Sélectionner le cours">
                    <IconButton className={classes.greenIcon} onClick={this.openConfirmDialog.bind(this, lessonDay)}>
                      <Save />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
      <Dialog open={this.state.openConfirmDialog}>
        <DialogTitle>Utiliser votre crédit</DialogTitle>
        <DialogContent>
            Vous êtes sur le point d'utiliser votre crédit pour prendre un nouveau cours. Merci de confirmer
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeConfirmDialog.bind(this)}>
            Annuler 
          </Button>
          <Button color="primary" onClick={this.useCredit.bind(this)}>
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

export default withApollo(withRouter(withStyles(styles)(Credit)))