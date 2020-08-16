import React from 'react'
import Loader from '../global/Loader'
import { withStyles } from '@material-ui/core/styles';
import { Euro } from '@material-ui/icons'
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import Snackbar from '@material-ui/core/Snackbar'
import MaterialTable from 'material-table'
import { InputAdornment, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Container, CssBaseline, Typography, Table, TableHead, TableRow, Checkbox, TableCell, TableBody } from '@material-ui/core'
import { GET_USERS, SEND_GLOBAL_EMAIL } from '../../database/query/userQuery'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { UPDATE_IS_ADMIN, UPDATE_IS_TEACHER } from '../../database/mutation/userMutation'
import { ADMIN_CREATE_DISCOUNT } from '../../database/mutation/discountMutation'
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
      columns: [
        { title: 'Prénom', field: 'firstName' },
        { title: 'Nom', field: 'lastName' },
        { title: 'Email', field: 'email' },
        { title: 'Téléphone', field: 'phone' },
        { title: 'Genre', field: 'gender' },
        { title: 'Nombre de crédit', field: 'totalCredit' },
        { title: 'Professeur', field: 'isTeacher', render: rowData => 
          <Checkbox
            name="isTeacher"
            id="isTeacher"
            checked={rowData.user.isTeacher}
            onChange={event => this.handleTeacherChange(rowData.user.id, event)}
            color="primary"
          />
        },
        { title: 'Administrateur', field: 'isAdmin', render: rowData =>
          <Checkbox
            name="isAdmin"
            id="isAdmin"
            checked={rowData.user.isAdmin}
            onChange={event => this.handleAdminChange(rowData.user.id, event)}
            color="primary"
          />
        },
      ],
      rows: [],
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
      openDialog: false,
      loading: false,
      message: '',
      openDiscountDialog: false,
      selectedUser: null,
      discountValue: 0
    }
  }

  componentDidMount() {
    this.props.client.query({
      query: GET_USERS
    })
    .then(result => {
      var lRows = []
      for(const user of result.data.users) {
        lRows.push({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          totalCredit: user.credits.length,
          isTeacher:  user.isTeacher,
          isAdmin: user.isAdmin,
          user: user
        })
      }
      this.setState({ rows: lRows })
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

  createDiscount = () => {
    this.setState({
      openDiscountDialog: false,
      loading: true
    })
    this.props.client.mutate({
      mutation: ADMIN_CREATE_DISCOUNT,
      variables: {
        user: this.state.selectedUser.id,
        value: parseFloat(this.state.discountValue)
      }
    })
    .then(result => {
      this.setState({
        loading: false
      })
      this.showSnackMessage('Le bon d\'achat a bien été crée', 'success')
    })
    .catch(error => {
      this.setState({
        loading: false
      })
      this.showSnackMessage('Erreur lors de la création du bon d\'achat', 'error')
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

  handleTeacherChange = (id, event) => {
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
      this.showSnackMessage('L\'utilisateur est maintenant un professeur', 'success')
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la mise à jour de l\'utilisateur', 'error')
    })
  }

  handleAdminChange = (id, event) => {
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
      this.showSnackMessage('L\'utilisateur est maintenant un administrateur', 'success')
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la mise à jour de l\'utilisateur', 'error')
    })
  }

  handleDiscountDialog = (user) => {
    if(!this.state.openDiscountDialog){
      this.setState(
        {
          openDiscountDialog: true,
          selectedUser: user
        }
      )
    }else{
      this.setState(
        {
          openDiscountDialog: false,
        }
      )
    }
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
        <MaterialTable
          title="Liste des utilisateurs"
          columns={this.state.columns}
          data={this.state.rows}
          actions={[
            {
              icon: () => <Euro />,
              tooltip: 'Ajouter un bon d\'achat',
              onClick: (event, rowData) => this.handleDiscountDialog(rowData.user)
            }
          ]}
        />
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
      <Dialog open={this.state.openDiscountDialog} fullWidth={true} maxWidth='md'>
        <DialogTitle>Créer un bon d'achat</DialogTitle>
        <DialogContent>
          <DialogContentText>Un bon d'achat sera généré pour {this.state.selectedUser ? this.state.selectedUser.firstName : '' } {this.state.selectedUser ? this.state.selectedUser.lastName : '' } de la valeur entrée ci-dessous. L'utilisateur recevra un email avec son code.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="montant"
            label="Montant"
            type="number"
            fullWidth
            startAdornment={<InputAdornment position="end">€</InputAdornment>}
            value={this.state.discountValue}
            onChange={ event =>  {this.setState({ discountValue: event.target.value })}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {this.setState({ openDiscountDialog: false })}} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={() => this.createDiscount()} color="primary" disabled={this.state.loading}>
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