import React, { useEffect } from 'react'
import moment from 'moment-timezone'
import Loader from '../../global/Loader.js'
import axios from 'axios'
//import chargebee from 'chargebee'
import { useHistory } from 'react-router-dom'
import { Container, CssBaseline, Typography, Grid, Button } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useApolloClient } from 'react-apollo'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { GET_PRIORITY_SESSION } from '../../../database/query/payementQuery'
import { GET_SUBSCRIPTION } from '../../../database/query/subscriptionQuery' 
import { GET_AUTHENTIFICATION, UPDATE_AUTHENTIFICATION } from '../../../store/authentification'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

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

interface PriorityPayementProps extends RouteComponentProps {
  reference: string;
}
// SI molliCustomerID est nouveau: changer les data dans Authentification
// Si reference !== null vérifier la reference et le status
const PriorityPayement = (props: PriorityPayementProps) => {
  const [loading, setLoading] = React.useState(true)
  const [paid, setPaid] = React.useState(false)
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(client.readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const history = useHistory()
  const classes = useStyles()
  
  
  useEffect(() => {
    if(!paid){
      client.query({
        query: GET_SUBSCRIPTION,
        variables: {
          id: props.match.params.subscription
        }

      })
      .then(result => {
        var subscription  = result.data.subscription
        if(subscription.subStatus === 'WAITING_PAYEMENT') {
          client.query({
            query: GET_PRIORITY_SESSION,
            variables: {
              user: subscription.user,
              subscription: subscription
            }
          })
          .then(result => {
            console.log(result)
            window.location = result.data.getPrioritySession._links.checkout.href
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
      <h1>Vous avez déjà payé cet abonnement.</h1>
    )
  }

}

export default withRouter(PriorityPayement)
