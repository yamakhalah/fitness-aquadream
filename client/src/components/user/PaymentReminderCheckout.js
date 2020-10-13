import React, { useEffect } from 'react'
import Loader from '../global/Loader.js'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container, CssBaseline, Typography, Grid, Button } from '@material-ui/core'
import { useApolloClient } from 'react-apollo'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { GET_PAYMENT_REMINDER } from '../../database/query/paymentReminderQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'

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

interface PaymentReminderProps extends RouteComponentProps {
  paymentReminder: string
}

const PaymentReminderCheckout = (props: PaymentReminderProps) => {
  const [loading, setLoading] = React.useState(true)
  const [success, setSuccess] = React.useState(false)
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(client.readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const history = useHistory()
  const classes = useStyles()

  useEffect(() => {
    if(props.match.params.paymentReminder !== 'null'){
      setTimeout(() => {
        client.query({
          query: GET_PAYMENT_REMINDER,
          variables: {
            id: props.match.params.paymentReminder
          },
          fetchPolicy: 'network-only'
        })
        .then(result => {
          console.log(result)
          if(result.data.paymentReminder.resolved) {
            setSuccess(true)
            setLoading(false)
          }else{
            setSuccess(false)
            setLoading(false)
          }       
        })
        .catch(error => {
          console.log(error)
          setSuccess(false)
          setLoading(false)
        })
      }, 3000)
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
    return(
      <div className={classes.root}>
        <Typography component="h1" variant="h4" align="center">
          Paiement réussi
        </Typography>
        <h4>Votre abonnement est à nouveau actif. Vous pouvez retrouver tous les cours de celui-ci sur votre calendrier</h4>
        <h4>Veillez à avoir assez de sous sur le compte débité pour éviter ce genre de désagréement. Veuillez aussi éviter de refuser les paiements du prestataire de paiement MOLLIE qui vous préviendra toujours quelques jours avant le débit.</h4>
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
        <h4>Votre paiement a été refusé par notre intermédiaire bancaire. Si vous avez été quand même débité, merci de contacter l'administrateur du site.</h4>
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

export default withRouter(PaymentReminderCheckout)