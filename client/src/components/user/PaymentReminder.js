import React, { useEffect } from 'react';
import Loader from '../global/Loader.js'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { useApolloClient } from 'react-apollo'
import { GET_PAYMENT_REMINDER_SESSION, GET_PAYMENT_REMINDER } from '../../database/query/paymentReminderQuery'
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

const PaymentReminder = (props: PaymentReminderProps) => {
  const [loading, setLoading] = React.useState(true)
  const [paid, setPaid] = React.useState(false)
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(client.readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const history = useHistory()
  const classes = useStyles()

  useEffect(() => {
    if(!paid){
      client.query({
        query: GET_PAYMENT_REMINDER,
        variables: {
          id: props.match.params.paymentReminder
        }
      })
      .then(result => {
        var paymentReminder = result.data.paymentReminder
        if(!paymentReminder.resolved){
          client.query({
            query: GET_PAYMENT_REMINDER_SESSION,
            variables: {
              id: props.match.params.paymentReminder
            }
          })
          .then(result => {
            window.location = result.data.getPaymentReminderSession._links.checkout.href
          })
          .catch(error => {
            console.log(error)
          })
        }else{
          setPaid(true)
          setLoading(false)
        }
      })
      .catch(error => {
        console.log(error)
      })
    }
  }, [loading])

  if(loading) {
    return(
      <div className={classes.loader}>
        <Loader />
      </div>
    )
  }else if(paid){
    return(
      <h1>Vous avez déjà réglé ce rappel de paiement.</h1>
    )
  }
}

export default withRouter(PaymentReminder)