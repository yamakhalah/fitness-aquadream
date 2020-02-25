import React from 'react';
import { Button, Checkbox, Link, Grid, Box, FormControl, InputLabel, MenuItem, Select, Typography, CssBaseline, Container, FormControlLabel } from '@material-ui/core';
import emailjs from 'emailjs-com'
import Copyright from './Copyright'
import Snackbar from '@material-ui/core/Snackbar'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import logo from '../../style/img/Aquadream-outlined-transparent.png'
import { CREATE_USER } from '../../database/mutation/userMutation'
import { CustomSnackBar } from './CustomSnackBar' 

const styles = theme => ({
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
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  formControl: {
    minWidth: '100%',
  },
  img: {
    width: '70%',
    margin: 0,
    padding: 0
  },
  controlCheck: {
    textAlign: 'left'
  }
});

class SignUp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'MALE',
      phone: '',
      errorMessage: '',
      errorVariant: 'error',
      confirmHealth: false,
      confirmRules: false,
      open: false
    }
  }

  componentDidMount() {
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      if(value !== this.state.password) {
        return false
      }
      return true
    })
  }

  signUp() {
    if(!this.state.confirmHealth || !this.state.confirmRules){
      this.setState({'errorMessage': 'Merci de cocher les cases d\'autorisation'})
      this.setState({'errorVariant': 'error'})
      this.setState({'open': true})
      return
    }
    this.props.client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: this.state.email,
        password: this.state.password,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        phone: this.state.phone,
        gender: this.state.gender
      }
    })
    .then(result => {
      this.props.history.push('/login', {open: true, errorVariant: 'success', errorMessage: 'Votre compte a bien été crée'})
    })
    .catch(error => {
      console.log(error)
      if(!error.graphQLErrors){
        this.setState({'errorMessage': 'Une erreur est survenue durant la création de votre compte. Veuillez contacter l\'administrateur du site'})
      } else if (error.graphQLErrors[0].extensions.exception.code === 11000) {
        this.setState({'errorMessage': 'Cette adresse email est déjà enregistrée'})
      } 
      this.setState({'errorVariant': 'error'})
      this.setState({'open': true})
    })
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleClose = () => {
    this.setState({'open': false})
  }

  render() {
    const { classes } = this.props
    return (
      <div>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <div className={classes.paper}>
          <img src={logo} className={classes.img} alt="logo"/>
          <Typography component="h1" variant="h5">
            Inscription
          </Typography>
          <ValidatorForm className={classes.form} noValidate onSubmit={this.signUp.bind(this)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextValidator
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label="Prénom"
                  autoFocus
                  value={this.state.firstName}
                  validators={['required', 'matchRegexp:^[A-zÀ-ú]+(([\',. -][A-zÀ-ú])?[A-zÀ-ú]*)*$']}
                  errorMessages={['Champ requis', 'Format incorrect']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextValidator
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label="Nom"
                  name="lastName"
                  autoComplete="lname"
                  value={this.state.lastName}
                  validators={['required', 'matchRegexp:^[A-zÀ-ú]+(([\',. -][A-zÀ-ú])?[A-zÀ-ú]*)*$']}
                  errorMessages={['Champ requis', 'Format incorrect']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="gender">Sexe</InputLabel>
                <Select
                  labelId="gender"
                  id="gender"
                  value={this.state.gender}
                  label="Sexe"
                  labelWidth={35}
                  name="gender"
                  onChange={event => this.handleChange(event)}
                >
                  <MenuItem value="" disabled>
                    Sexe
                  </MenuItem>
                  <MenuItem value="MALE">Homme</MenuItem>
                  <MenuItem value="FEMALE">Femme</MenuItem>
                </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextValidator
                  variant="outlined"
                  required
                  fullWidth
                  name="phone"
                  label="Téléphone Mobile"
                  id="phone"
                  autoComplete="phone"
                  value={this.state.phone}
                  validators={['required', 'matchRegexp:^((\\+)32|0|0032)[1-9](\\d{2}){4}$']}
                  errorMessages={['Champ requis', 'Format incorrect']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextValidator
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Adresse Mail"
                  name="email"
                  autoComplete="email"
                  value={this.state.email}
                  validators={['required', 'isEmail']}
                  errorMessages={['Champ requis', 'Email non valide']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextValidator
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={this.state.password}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextValidator
                  variant="outlined"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmez Mot de passe"
                  type="password"
                  id="confirmPassword"
                  autoComplete="current-password"
                  value={this.state.confirmPassword}
                  validators={['required', 'isPasswordMatch']}
                  errorMessages={['Champ requis', 'Les mots de passe sont différents']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} className={classes.controlCheck}>
                <FormControlLabel
                  control={<Checkbox value={this.state.confirmRules} color="primary" />}
                  label="J'accepte les CGU et le ROI."
                />
              </Grid>
              <Grid item xs={12} className={classes.controlCheck}>
                <FormControlLabel
                  control={<Checkbox value={this.state.confirmHealth} color="primary" />}
                  label="J'ai l'autorisation de mon médecin pour pratiquer ces sports"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Inscription
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="/" variant="body2">
                  Déjà un compte ? Connectez-vous.
                </Link>
              </Grid>
            </Grid>
          </ValidatorForm>
        </div>
        <Box mt={5}>
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

export default withApollo(withRouter(withStyles(styles)(SignUp)))