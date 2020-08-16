import React from 'react';
import { useEffect } from "react"
import { useApolloClient } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { CustomSnackBar } from './CustomSnackBar'
import { CssBaseline, Grid, Paper, Typography, Button, Snackbar } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { CHANGE_PASSWORD } from '../../database/mutation/userMutation'
import { makeStyles } from '@material-ui/core/styles'
import logo from '../../style/img/Aquadream-outlined-transparent.png'


const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%'
  },
  paper: {
    margin: theme.spacing(0, 4),
    paddingTop: '20%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '50%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  img: {
    width: '60%',
    margin: 0,
    padding: 0
  },
}))

export default function ChangePassword() {
  const classes = useStyles()
  const [client,] = React.useState(useApolloClient())
  const [history,] = React.useState(useHistory())
  const [user, setUser] = React.useState(useApolloClient().readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const [oldPassword, setOldPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [newPasswordBis, setNewPasswordBis] = React.useState('')
  const [openSnack, setOpenSnack] = React.useState(false)
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')

  useEffect(() => {
    
  }, )

  const changePassword = () => {
    if(oldPassword === '' || newPassword === '' || newPasswordBis === '') {
      showSnackMessage('Un des champs est vide !', 'error')
    }else if(newPassword !== newPasswordBis) {
      showSnackMessage('Les deux champs du nouveau mot de passe ne correspondent pas !', 'error')
    }else {
      client.mutate({
        mutation: CHANGE_PASSWORD,
        variables: {
          id: user.userID,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }
      })
      .then(result => {
        window.localStorage.clear()
        client.resetStore().then(() => {
          history.push('/login')
        })
      })
      .catch(error => {
        showSnackMessage('Votre ancien mot de passe n\'est pas correct !', 'error')
      })
    }
  }

  const handleClose = () => {
    setOpenSnack(false)
  }

  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }

  return (
    <React.Fragment>
      <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={3} />
      <Grid item xs={6} square>
      <div className={classes.paper}>
        <img src={logo} className={classes.img} alt="logo"/>
        <Typography component="h1" variant="h5">
          Changer de mot de passe
        </Typography>
        <ValidatorForm className={classes.form} noValidate onSubmit={changePassword}>
          <TextValidator
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Ancien mot de passe"
            type="password"
            id="oldPassword"
            value={oldPassword}
            autoComplete="current-password"
            onChange={event => setOldPassword(event.target.value)}
            validators={['required']}
            errorMessages={['Champ requis']}
          />
          <TextValidator
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nouveau mot de passe"
            type="password"
            id="newPassword"
            value={newPassword}
            autoComplete="current-password"
            onChange={event => setNewPassword(event.target.value)}
            validators={['required']}
            errorMessages={['Champ requis']}
          />
          <TextValidator
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nouveau mot de passe"
            type="password"
            id="newPasswordBis"
            value={newPasswordBis}
            autoComplete="current-password"
            onChange={event => setNewPasswordBis(event.target.value)}
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
            Connexion
          </Button>
          </ValidatorForm>
      </div>
      </Grid>
    </Grid>
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      open={openSnack}
      autoHideDuration={5000}
      onClose={handleClose}
    >
      <CustomSnackBar
        onClose={handleClose}
        variant={errorVariant}
        message={errorMessage}
      />
    </Snackbar>
    </React.Fragment>
  )
}