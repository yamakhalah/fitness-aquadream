import React from 'react'
import Loader from '../global/Loader'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Container, CssBaseline, Typography, Table, TableHead, TableRow, Checkbox, TableCell, TableBody } from '@material-ui/core'
import { GET_USERS, SEND_GLOBAL_EMAIL } from '../../database/query/userQuery'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { UPDATE_IS_ADMIN, UPDATE_IS_TEACHER } from '../../database/mutation/userMutation'
import { CustomSnackBar } from '../global/CustomSnackBar'

const styles = theme => ({
  root: {
    marginTop: 25,
    backgroundColor: 'white',
    paddingTop: 30,
    paddingBottom: 30
  },

  title: {
    marginTop: 50
  },

  table: {
    marginTop: 50
  },

  button: {
    float: 'right'
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh'
  }
})

class AdminUser extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
      openDialog: false,
      loading: false,
      message: ''
    }
  }

  componentDidMount() {
    this.props.client.query({
      query: GET_USERS
    })
    .then(result => {
      this.setState({ users: result.data.users })
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la récupération des utilisateurs', 'error')
    })
  }

  sendEmail = () => {
    this.setState({ 
      openDialog: false,
      loading: true
    })
    this.props.client.query({
      query: SEND_GLOBAL_EMAIL,
      variables: {
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

  handleTeacherChange = (id, event, index) => {
    const { name, checked } = event.target
    this.props.client.mutate({
      mutation: UPDATE_IS_TEACHER,
      variables: {
        id: id,
        isTeacher: checked
      },
      refetchQueries: [{
        query: GET_USERS
      }]
    })
    .then(result => {
      var users = this.state.users
      users[index].isTeacher = checked
      this.setState({
        users: users
      })
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la mise à jour de l\'utilisateur', 'error')
    })
  }

  handleAdminChange = (id, event, index) => {
    const { name, checked } = event.target
    this.props.client.mutate({
      mutation: UPDATE_IS_ADMIN,
      variables: {
        id: id,
        isAdmin: checked
      },
      refetchQueries: [
        {
          query: GET_USERS
        },
        {
          query: GET_TEACHERS
        }
      ]
    })
    .then(result => {
      var users = this.state.users
      users[index].isAdmin = checked
      this.setState({
        users: users
      })
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la mise à jour de l\'utilisateur', 'error')
    })
  }

  render(){
    const { classes } = this.props

    if (this.state.loading) return (
      <div className={classes.loader}>
        <Loader />
      </div>
    )

    return(
      <div>
      <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <Typography component="h1" variant="h5">
          Utilisateurs
        </Typography>
        <Button className={classes.button} color="primary" disabled={this.state.loading} onClick={() => {this.setState({ openDialog: true })}}>Envoyer un email</Button>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell numeric='false'>Prénom</TableCell>
              <TableCell numeric='false'>Nom</TableCell>
              <TableCell numeric='false'>Email</TableCell>
              <TableCell numeric='true'>Téléphone</TableCell>
              <TableCell numeric='false'>Genre</TableCell>
              <TableCell numeric='true'>Nombre de crédit</TableCell>
              <TableCell numeric='false'>Professeur</TableCell>
              <TableCell numeric='false'>Administrateur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell component="th" scope="row">{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{user.credits.length}</TableCell>
                <TableCell>
                  <Checkbox
                    name="isTeacher"
                    id="isTeacher"
                    checked={user.isTeacher}
                    onChange={event => this.handleTeacherChange(user.id, event, index)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    name="isAdmin"
                    id="isAdmin"
                    checked={user.isAdmin}
                    onChange={event => this.handleAdminChange(user.id, event, index)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
      <Dialog open={this.state.openDialog} fullWidth={true} maxWidth='md'>
        <DialogTitle>Envoyer un message</DialogTitle>
        <DialogContent>
          <DialogContentText>Ce message sera envoyé à tous les utilisateurs de l'application Aquadream</DialogContentText>
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
          <Button onClick={() => {this.setState({ openDialog: false })}} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={() => this.sendEmail()} color="primary" disabled={this.state.loading}>
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
        autoHideDuration={4000}
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

export default withApollo(withRouter(withStyles(styles)(AdminUser)))