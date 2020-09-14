import React from 'react';
import { makeStyles } from '@material-ui/core/styles'
import { useApolloClient } from  'react-apollo'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { Snackbar, Typography, Button, TextField, Container, CssBaseline } from '@material-ui/core'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { SEND_SUPPORT_EMAIL } from '../../database/query/userQuery.js'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2) ,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh'
  },
  typoTitle: {
    marginTop: 25,
    marginBottom: 25
  },
}))

export default function Support(props) {
  const classes = useStyles()
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(useApolloClient().readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const [message, setMessage] = React.useState('')
  const [openSnack, setOpenSnack] = React.useState(false)
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')

  const sendEmail = () => {
    client.query({
      query: SEND_SUPPORT_EMAIL,
      variables:{
        user: user.userID,
        message: message
      }
    })
    .then(result => {
      setMessage('')
      showSnackMessage('Votre email a bien été envoyé. Nous vous répondrons rapidement.', 'success')
    })
    .catch(error => {
      console.log(error)
      showSnackMessage('Erreur lors de l\'envoi de votre email', 'error')
    })
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
  }
  
  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }

  return (
    <React.Fragment>
      <Container component="main" maxWidth="md" className={classes.root}>
      <CssBaseline />
      <Typography component="h1" variant="h5" className={classes.typoTitle}>
        Envoyer un message au support
      </Typography>
      <Typography component="body1" className={classes.typoTitle}>
        Vous êtes au bon endroit si vous avez le moindre soucis avec le site web d'Aquadream. Merci d'être le plus précis possible concernant le problème que vous rencontrez afin que nous puissions rapidement nous occuper de votre problème.
      </Typography>
      <TextField
            className={classes.typoTitle}
            autoFocus
            margin="dense"
            id="message"
            label="Message"
            type="text"
            multiline
            rows={5}
            fullWidth
            value={message}
            onChange={ event =>  setMessage(event.target.value)}
        />
        <Button variant="contained" color="primary" onClick={event => sendEmail()}>
          Envoyer
        </Button>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={openSnack}
          autoHideDuration={5000}
          onClose={handleSnackClose.bind(this)}
        >
          <CustomSnackBar
            onClose={handleSnackClose.bind(this)}
            variant={errorVariant}
            message={errorMessage}
          />
        </Snackbar>
      </Container>
    </React.Fragment>
  )
}
