import React from 'react';
import { Button, Checkbox, Link, Grid, Box, FormControl, InputLabel, MenuItem, Select, Typography, CssBaseline, Container } from '@material-ui/core';
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
  },
  active: {
    "&:hover": {
      color: "black !important"
    },
    "&:visited": {
      color: "black !important",
      textDecoration: "none"
    },
    "&:active": {
      color: "black !important",
      textDecoration: 'none'
    },
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
      confirmSales: false,
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
    if(!this.state.confirmHealth || !this.state.confirmRules || !this.state.confirmSales){
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

  handleCheck(event) {
    switch(event.target.name) {
      case 'confirmRules': 
        this.setState({
          confirmRules: !this.state.confirmRules
        })
        break
      case 'confirmSales': 
        this.setState({
          confirmSales: !this.state.confirmSales
        })
        break
      case 'confirmHealth': 
        this.setState({
          confirmHealth: !this.state.confirmHealth
        })
        break
      default:
        break
    }
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
          <Typography variant="subtitle2" style={{ color: 'red'}}>
          Des messages d'erreur apparaîtront tant que vous n'avez pas correctement remplis le formulaire. Ne vous en inquiétez pas si vous n'avez pas terminé de remplir un champ
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
                  validators={['required', 'matchRegexp:[a-zA-Z\u00C0-\u017F\s]+']}
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
                  validators={['required', 'matchRegexp:[a-zA-Z\u00C0-\u017F\s]+']}
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
                <label style={{flexDirection: 'row', alignItems: 'center', display: 'flex'}}>
                  <Checkbox
                      name="confirmSales"
                      style={{width: 'auto', display: 'inline-block', color: '#000000'}}
                      checked={this.props.confirmSales}
                      onChange={event => this.handleCheck(event)}
                  />
                  <Link className={classes.active} href="/cgv" target="_blank" onClick={event => event.pevent}>
                    J'ai lu et j'accepte les CGU
                  </Link>
                </label>
              </Grid>
              <Grid item xs={12} className={classes.controlCheck}>
                <label style={{flexDirection: 'row', alignItems: 'center', display: 'flex'}}>
                  <Checkbox
                      name="confirmRules"
                      style={{width: 'auto', display: 'inline-block', color: '#000000'}}
                      checked={this.props.confirmRules}
                      onChange={event => this.handleCheck(event)}
                  />
                  <Typography>
                  <Link className={classes.active} href="/roi" target="_blank" onClick={event => event.pevent}>
                    J'ai lu et j'accepte le ROI
                  </Link>
                  </Typography>
                </label>
              </Grid>
              <Grid item xs={12} className={classes.controlCheck}>
              <label style={{flexDirection: 'row', alignItems: 'center', display: 'flex'}}>
                  <Checkbox
                      name="confirmHealth"
                      style={{width: 'auto', display: 'inline-block'}}
                      cchecked={this.props.confirmHealth}
                      onChange={event => this.handleCheck(event)}
                  />
                    J'ai l'autorisation de mon médecin pour pratiquer ces sports et je m'engage à fournir, avant les premiers cours, un certificat d'aptitude d'un médecin
                </label>
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