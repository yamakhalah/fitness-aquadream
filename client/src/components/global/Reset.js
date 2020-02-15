import React from 'react';
import { Button, Box,Typography, Container } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Snackbar from '@material-ui/core/Snackbar'
import logo from '../../style/img/Aquadream-outlined-transparent.png'
import { CustomSnackBar } from './CustomSnackBar' 
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { withStyles } from '@material-ui/styles';
import { withApollo } from 'react-apollo'
import { withRouter} from 'react-router-dom'
import { RESET_PASSWORD } from '../../database/mutation/userMutation'
import Copyright from './Copyright'

const styles = theme => ({
  paper: {
    marginTop: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: 1,
    //backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: 10,
  },
  submit: {
    margin: 3
  },
  img: {
    width: '100%',
    margin: 0,
    padding: 0
  },
});

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      open: false,
      errorVariant: 'error',
      errorMessage: ''
    }
  }

  handleClose = () => {
    this.setState({'open': false})
  }

  reset = () => {
    this.props.client.mutate({
      mutation: RESET_PASSWORD,
      variables: {
        email: this.state.email
      }
    })
    .then(result => {
      this.props.history.push('/login', {open: true, errorVariant: 'success', errorMessage: 'Un email vous a été envoyé avec votre mot de passe'})
    })
    .catch(error => {
      console.log(error)
    })
  }

  render() {
    const { classes } = this.props
    return(
      <div>
      <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <img src={logo} className={classes.img} alt="logo"/>
        <Typography component="h1" variant="h5">
          Réinitialisation du mot de passe
        </Typography>
        <ValidatorForm className={classes.form} noValidate onSubmit={this.reset.bind(this)}>
          <TextValidator
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse Mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={this.state.email}
            onChange={event => this.setState({email: event.target.value})}
            validators={['required']}
            errorMessages={['Champ requis']}
          />
          <Button
            //type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            type="submit"
          >
            Réinitialiser
          </Button>
          </ValidatorForm>
        
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      open={this.state.open}
      autoHideDuration={5000}
      onClose={this.handleClose}
    >
      <CustomSnackBar
        onClose={this.handleClose}
        variant={this.state.errorVariant}
        message={this.state.errorMessage}
      />
    </Snackbar>
    </div>
    )
  }
}

export default withRouter(withApollo(withStyles(styles)(Login)))