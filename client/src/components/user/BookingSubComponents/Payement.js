import React, { useEffect } from 'react'
import moment from 'moment'
import Loader from '../../global/Loader.js'
import axios from 'axios'
//import chargebee from 'chargebee'
import { useHistory } from 'react-router-dom'
import { Container, CssBaseline, Typography, Grid, Button } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useApolloClient } from 'react-apollo'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { GET_MOLLIE_CHECKOUT_RESULT } from '../../../database/query/payementQuery'
import { GET_AUTHENTIFICATION, UPDATE_AUTHENTIFICATION } from '../../../store/authentification'

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(25)
  },
  loader: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttons: {
    padding: theme.spacing(2)
  },
}))

interface PayementProps extends RouteComponentProps {
  reference: string;
}
// SI molliCustomerID est nouveau: changer les data dans Authentification
// Si reference !== null vérifier la reference et le status
const Payement = (props: PayementProps) => {
  const [loading, setLoading] = React.useState(true)
  const [preBooked, setPreBooked] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(client.readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const history = useHistory()
  const classes = useStyles()
  
  
  useEffect(() => {
    if(props.match.params.reference === 'prebooked'){
      setSuccess(true)
      setPreBooked(true)
      setLoading(false)
    }else if(props.match.params.reference !== 'null'){
      setTimeout(() => {
      client.query({
        query: GET_MOLLIE_CHECKOUT_RESULT,
        variables: {
          paymentRef: props.match.params.reference
        },
        fetchPolicy: 'network-only'
      })
      .then(result => {
        if(Object.entries(result.data.getMollieCheckoutResult).length > 0){
          const mollieSubscription = result.data.getMollieCheckoutResult
          client.mutate({
            mutation: UPDATE_AUTHENTIFICATION,
            variables: {
              input: {
                isAuthenticated: true,
                isAdmin: user.isAdmin,
                isTeacher: user.isTeacher,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userID: user.userID,
                mollieCustomerID: mollieSubscription.customerId,
                token: user.token
              }
            }
          })
          setSuccess(true)
          setPreBooked(false)
          setLoading(false)
        }else{
          setSuccess(false)
          setPreBooked(false)
          setLoading(false)
        }
      })
      .catch(error => {
        console.log(error)
        setSuccess(false)
        setPreBooked(false)
        setLoading(false)
      })

    }, 2000);
    }else{
      setSuccess(false)
      setPreBooked(false)
    }
  }, [loading])

  const backToHome = () => {
    history.push('/')
  }
  
  if(loading) {
    return(
      <div className={classes.loader}>
        <Loader />
      </div>
    )
  }else if(success){
    if(preBooked){
      return(
        <div className={classes.root}>
          <Typography component="h1" variant="h4" align="center">
            Pré-réservation réussie
          </Typography>
          <h4>Vous êtes maintenant dans notre liste d'attente. Nous vous préviendrons par mail dès que le cours est ouvert</h4>
          <Button
            variant="contained"
            color="primary"
            onClick={backToHome}
            className={classes.button}
          >
            Retour à l'accueil
          </Button>
        </div>
      )
    }else{
      return(
        <div className={classes.root}>
          <Typography component="h1" variant="h4" align="center">
            Réservation réussie
          </Typography>
          <h4>Votre abonnement est maintenant actif ! Vous avez payé la première échéance. La prochaine sera débitée un mois après le début de vos cours</h4>
          <h4>Si vous avez sélectionné des cours en pré-réservation vous êtes maintenant dans notre liste d'attente. Nous vous préviendrons par mail dès que le cours est ouvert </h4>
          <Button
            variant="contained"
            color="primary"
            onClick={backToHome}
            className={classes.button}
          >
            Retour à l'accueil
          </Button>
        </div>
      )
    }
  }else if(!success){
    if(preBooked){
      return(
        <div className={classes.root}>
          <Typography component="h1" variant="h4" align="center">
            Pré-réservation échouée
          </Typography>
          <h4>Une erreur inattendue est survenue lors de la pré-réservation. L'administrateur du site a normalement été prévenu</h4>
          <Button
            variant="contained"
            color="primary"
            onClick={backToHome}
            className={classes.button}
          >
            Retour à l'accueil
          </Button>
        </div>
      )
    }else{
      return(
        <div className={classes.root}>
          <Typography component="h1" variant="h4" align="center">
            Echec du paiement
          </Typography>
          <h4>Votre paiement a été refusé par notre intermédiaire bancaire. Si vous avez été débité par erreur, merci de contacter l'administrateur du site.</h4>
          <h4>Si vous avez sélectionné des cours en pré-réservation vous êtes maintenant dans notre liste d'attente. Nous vous préviendrons par mail dès que le cours est ouvert </h4>
          <Button
            variant="contained"
            color="primary"
            onClick={backToHome}
            className={classes.button}
          >
            Retour à l'accueil
          </Button>
        </div>
      )
    }
  }

}

export default withRouter(Payement)


/*
<Container component="main" maxWidth="sm">
        <CssBaseline />
        <Typography component="h1" variant="h4">
          Coordonnées bancaires
        </Typography>
        <ValidatorForm className={classes.form} noValidate onSubmit={checkout} disabled={loading}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextValidator
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="Prénom"
                autoFocus
                value={firstName}
                validators={['required']}
                errorMessages={['Champ requis']}
                onChange={event => setFirstName(event.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextValidator
                name="lastName"
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Nom de famille"
                value={lastName}
                validators={['required']}
                errorMessages={['Champ requis']}
                onChange={event => setLastName(event.value)}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextValidator
                name="iban"
                variant="outlined"
                required
                fullWidth
                id="iban"
                label="IBAN"
                value={iban}
                validators={['required', 'matchRegexp:[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{4}[0-9]{7}([a-zA-Z0-9]?){0,16}']}
                errorMessages={['Champ requis']}
                onChange={event => setIban(event.value)}
              />
            </Grid>
          </Grid>
        </ValidatorForm>
      </Container>

      */