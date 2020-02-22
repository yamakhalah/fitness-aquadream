import React from 'react';
import { Snackbar, Button, Checkbox, Grid, Box, Link, Container, Typography }from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import logo from '../../style/img/Aquadream-outlined-transparent.png'
import Copyright from './Copyright'
import { CustomSnackBar } from './CustomSnackBar' 
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { withStyles } from '@material-ui/styles';
import { withApollo } from 'react-apollo'
import { withRouter} from 'react-router-dom'
import { getErrorMessage } from '../../error'
import { LOGIN } from '../../database/query/userQuery'
import { NEW_AUTHENTIFICATION, GET_AUTHENTIFICATION } from '../../store/authentification.js'

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
    const savedMail = localStorage.getItem('email')
    if(this.props.location.state) {
      this.state = {
        email: savedMail !== null ? savedMail : "",
        password: "",
        remember: false,
        open: this.props.location.state.open,
        errorVariant: this.props.location.state.errorVariant,
        errorMessage: this.props.location.state.errorMessage
      }
    }else{
      this.state = {
        email: savedMail !== null ? savedMail : "",
        password: "",
        remember: false,
        open: false,
        errorVariant: 'error',
        errorMessage: ''
      }
    }
    this.props.client.query({query: GET_AUTHENTIFICATION})
      .then(result => {
        if(result.data.Authentification.isAuthenticated) {
          this.props.history.push('/')
        }
      })
  }

  handleClose = () => {
    this.setState({'open': false})
  }

  login = (email, password) => {
      this.props.client.query({
        query: LOGIN,
        variables: {email: email, password: password},
      })
      
      .then(result => {
          localStorage.setItem('token', result.data.login.token)
          this.props.client.mutate({
            mutation: NEW_AUTHENTIFICATION,
            variables: { 
              input: {
                isAuthenticated: true,
                isAdmin: result.data.login.user.isAdmin,
                isTeacher: result.data.login.user.isTeacher,
                firstName: result.data.login.user.firstName,
                lastName: result.data.login.user.lastName,
                email: result.data.login.user.email,
                userID: result.data.login.user.id,
                mollieCustomerID: result.data.login.user.mollieCustomerID,
                token: result.data.login.token
              }
            },
          })
          .then(result => {
            if(result.data.newAuthentification) {
              if(this.state.remember) {
                localStorage.setItem('email', this.state.email)
              }
              this.props.history.push('/')
            }
          })
          .catch(error => {
            console.log(error)
          })
      })
      .catch(error => {
        const errorInfo = getErrorMessage(error)
        this.setState({'errorMessage': errorInfo.message})
        this.setState({'errorVariant': errorInfo.variant})
        this.setState({'open': true})
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
          Connexion
        </Typography>
        <ValidatorForm className={classes.form} noValidate onSubmit={this.login.bind(this, this.state.email, this.state.password)}>
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
          <TextValidator
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            value={this.state.password}
            autoComplete="current-password"
            onChange={event => this.setState({password: event.target.value})}
            validators={['required']}
            errorMessages={['Champ requis']}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" onChange={event => this.setState({remember: event.target.value})}/>}
            label="Se souvenir de moi"
          />
          <Button
            //type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            type="submit"
          >
            Connexion
          </Button>
          </ValidatorForm>
          <Grid container>
            <Grid item xs>
              <Link href="/reset" variant="body2">
                Mot de passe oublié?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Inscrivez-vous"}
              </Link>
            </Grid>
          </Grid>
        
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