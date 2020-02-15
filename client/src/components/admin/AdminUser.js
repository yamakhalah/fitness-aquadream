import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import { Container, CssBaseline, Typography, Table, TableHead, TableRow, Checkbox, TableCell, TableBody } from '@material-ui/core'
import { GET_USERS } from '../../database/query/userQuery'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { UPDATE_IS_ADMIN, UPDATE_IS_TEACHER } from '../../database/mutation/userMutation'
import { CustomSnackBar } from '../global/CustomSnackBar'

const styles = theme => ({
  title: {
    marginTop: 50
  },

  table: {
    marginTop: 50
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
    return(
      <div>
      <Container component="main" maxWidth="xl" className={classes.title}>
        <CssBaseline />
        <Typography component="h1" variant="h5">
          Utilisateurs
        </Typography>
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