import React, { useEffect } from 'react'
import Loader from '../global/Loader'
import { makeStyles } from '@material-ui/core/styles'
import { Container, CssBaseline, Typography, Table, TableRow, TableCell, TableBody, TableHead } from '@material-ui/core'
import { useQuery, useMutation, useApolloClient } from  'react-apollo'
import { GET_SUBSCRIPTIONS } from '../../database/query/subscriptionQuery'
import { GET_MOLLIE_SUBSCRIPTION_DATA } from '../../database/query/payementQuery'
import moment from 'moment'

moment.locale('fr')

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: 25,
    backgroundColor: 'white',
    paddingTop: 30,
    paddingBottom: 30
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh'
  },

  table: {
    marginTop: 25
  }
}))

export default function AdminSubscription() {
  const classes = useStyles()
  const [client, setClient] = React.useState(useApolloClient())
  const [loading, setLoading] = React.useState(true)
  const [subscriptionsData, setSubscriptionsData] = React.useState([])
  const [openSnack, setOpenSnack] = React.useState(false)
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')

  const { load, error, data } = useQuery(GET_SUBSCRIPTIONS, { fetchPolicy: 'network-policy' })

  useEffect(() => {
    if(data) {
      var lSubscriptionsData = []
      var promises = []
      for(const subscription of data.subscriptions) {
        const promise = new Promise((resolve, reject) => {
          client.query({
            query:  GET_MOLLIE_SUBSCRIPTION_DATA,
            variables: {
              mollieCustomerID: subscription.user.mollieCustomerID,
              mollieSubscriptionID: subscription.payement.mollieSubscriptionID
            },
            fetchPolicy: 'network-only'
          })
          .then(result => {
            console.log(result)
            lSubscriptionsData.push({
              subscription: subscription,
              mollieSubscription: result.data.getMollieSubscriptionData
            })
            resolve()
          })
          .catch(error => {
            console.log(error)
            reject()
          })
        })
        promises.push(promise)
      }
      Promise.all(promises.map(p => p.catch(e => e)))
      .then(result => {
        setSubscriptionsData(lSubscriptionsData)
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
    }
  }, [data])

  const sortSubscriptions = (subscriptions) => {
    return subscriptions.sort((a,b) => Date.parse(a.subscription.created) - Date.parse(b.subscription.created))
  }

  if (loading) return (
    <div className={classes.loader}>
      <Loader />
    </div>
  )

  if (error) return (
    <div className={classes.errorText}>
      <h2>Erreur lors de la récupération des credits</h2>
      <p>{error.message}</p>
    </div>
  )

  return (
    <div>
      <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <Typography component="h1" variant="h5">
          Liste des abonnements
        </Typography>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Création</TableCell>
              <TableCell>Total Cours</TableCell>
              <TableCell>Statut Abonnement</TableCell>
              <TableCell>Début</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Prix Total</TableCell>
              <TableCell>Prix Mensuel</TableCell>
              <TableCell>Status du paiement</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortSubscriptions(subscriptionsData).map(subscriptionData => (
              <TableRow key={subscriptionData.subscription.id}>
                  <TableCell component="th" scope="row">{subscriptionData.subscription.id}</TableCell>
                  <TableCell>{subscriptionData.subscription.user.firstName} {subscriptionData.subscription.user.lastName}</TableCell>
                  <TableCell>{moment(subscriptionData.subscription.created).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{subscriptionData.subscription.lessons.length}</TableCell>
                  <TableCell>{subscriptionData.subscription.subStatus}</TableCell>
                  <TableCell>{moment(subscriptionData.subscription.validityBegin).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{moment(subscriptionData.subscription.validityEnd).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{subscriptionData.subscription.total}</TableCell>
                  <TableCell>{subscriptionData.subscription.totalMonth}</TableCell>
                  <TableCell>{subscriptionData.mollieSubscription.status}</TableCell>
                  <TableCell>a</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </div>
  )
}

