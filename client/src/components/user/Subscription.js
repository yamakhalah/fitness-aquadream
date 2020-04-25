import React from 'react'
import Loader from '../global/Loader'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation, useApolloClient } from  'react-apollo'
import { IconButton, Snackbar, Container, CssBaseline, Typography, Grid, Card, CardMedia, CardContent, CardActions, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { ExpandMore, Money } from '@material-ui/icons'
import { GET_SUBSCRIPTIONS_FOR_USER } from '../../database/query/subscriptionQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { GET_MOLLIE_SUBSCRIPTION_DATA } from '../../database/query/payementQuery'
import { lessonSubTypeToIMG } from '../../utils/enumToString'
import moment from 'moment-timezone'
import { borderRadius } from '@material-ui/system';

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

const useStyles = makeStyles(theme => ({
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh'
  },
  root: {
    padding: theme.spacing(2) 
  },
  img: {
  },
  content: {

  },
  typoTitle: {
    marginTop: 25,
    marginBottom: 25
  },
  typoSubTitle: {
    marginTop: 15,
    marginBottom: 20
  },
  typoLessonTitle: {
    marginTop: 5,
    marginBottom: 10
  },
  statusOK: {
    backgroundColor: theme.palette.secondary.main,
    maxWidth: '30%',
    margin: '0 auto',
    borderRadius: 30
  },
  statusKO: {
    backgroundColor: theme.palette.red.main,
    maxWidth: '30%',
    margin: '0 auto',
    borderRadius: 30
  },
  cover: {
    paddingTop: '40%', // 16:9,
    marginTop:'30'
  },
  expansionPanel: {
    marginTop: 15,
  }
}))

export default function Subscription(props) {
  const classes = useStyles()
  const [client, setClient] = React.useState(useApolloClient())
  const [user, setUser] = React.useState(useApolloClient().readQuery({query: GET_AUTHENTIFICATION}).Authentification)
  const [loading, setLoading] = React.useState(true)
  const [subscriptionsData, setSubscriptionsData] = React.useState([]) 
  const [openSnack, setOpenSnack] = React.useState(false)
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')

  const initSubscriptions = (data) => {
    // GET MOLLIE SUBSCRIPTION DATA FOR EVERY SUB
    var lSubscriptionsData = []
    var promises = []
    for(const subscription of data.subscriptionsForUser){
      const promise = new Promise((resolve, reject) => {
        client.query({
          query: GET_MOLLIE_SUBSCRIPTION_DATA,
          variables:{
            mollieCustomerID: user.mollieCustomerID,
            mollieSubscriptionID: subscription.payement.mollieSubscriptionID
          },
          fetchPolicy: 'network-only'
        })
        .then(result => {
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
    .then(results => {
      setSubscriptionsData(lSubscriptionsData)
      setLoading(false)
    })
    .catch(error => {
      console.log(error)
    })
  }

  const correctPayment = (subscriptionData) => {
    //TODO
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
  }
  
  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }

  const sortSubscriptions = (subscriptions) => {
    return subscriptions.sort((a,b) => Date.parse(a.subscription.recurenceBegin) - Date.parse(b.subscription.recurenceBegin))
  }

  const sortLessons = (lessons) => {
    return lessons.sort((a,b) => Date.parse(a.recurenceBegin) - Date.parse(b.recurenceBegin))
  }

  const { load, error, data } = useQuery(GET_SUBSCRIPTIONS_FOR_USER, { fetchPolicy: 'network-only', variables: { user: user.userID }, onCompleted: initSubscriptions })

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
    <div className={classes.root}>
      <Typography component="h1" variant="h5" className={classes.typoTitle}>
        Liste de vos abonnements
      </Typography>
      <Container component="main" maxWidth="xl" className={classes.root}>
      <CssBaseline />
        <Grid container spacing={5}>
          {sortSubscriptions(subscriptionsData).map(subscriptionData => (
            <Grid item xs={12} md={6} key={subscriptionData.subscription.id}>
              <Card className={classes.root}>
                <div className={classes.img}>
                  <CardMedia
                    className={classes.cover}
                    image={lessonSubTypeToIMG(subscriptionData.subscription.lessons[0].lessonSubType.name)}
                    title="Image"
                  />
                </div>
                <CardContent className={classes.content}>
                  <Typography component="h3" variant="h5" className={classes.typoSubTitle}>
                    Votre abonnement
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4} md={4}>
                      Référence:
                    </Grid>
                    <Grid item xs={8} md={8}>
                      {subscriptionData.subscription.id}
                    </Grid>
                    <Grid item xs={4} md={4}>
                      Crée le:
                    </Grid>
                    <Grid item xs={8} md={8}>
                      {moment(subscriptionData.subscription.created).format('DD/MM/YYYY à HH:mm')}
                    </Grid>
                    <Grid item xs={4} md={4}>
                      Début de validité:
                    </Grid>
                    <Grid item xs={8} md={8}>
                      {moment(subscriptionData.subscription.validityBegin).format('DD/MM/YYYY à HH:mm')}
                    </Grid>
                  </Grid>
                  <Typography component="h3" variant="h5" className={classes.typoSubTitle}>
                    Votre Paiement
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4} md={4}>
                      Montant mensuel: 
                    </Grid>
                    <Grid item xs={8} md={8}>
                      {Number(subscriptionData.mollieSubscription.amount.value)}€
                    </Grid>
                    <Grid item xs={4} md={4}>
                      Status: 
                    </Grid>
                    {subscriptionData.subscription.subStatus === 'WAITING_PAYEMENT' && 
                      <Grid item xs={8} md={8}>
                        <div className={classes.statusKO}>
                          Problème de paiement
                        </div>
                      </Grid>
                    }
                    {(subscriptionData.subscription.subStatus === 'WAITING_BEGIN' || subscriptionData.subscription.subStatus === 'ON_GOING' ) && 
                      <React.Fragment>
                      <Grid item xs={8} md={8}>
                        <div className={classes.statusOK}>
                          Actif
                        </div>
                      </Grid>
                      <Grid item xs={4} md={4}>
                        Prochain paiement: 
                      </Grid>
                      <Grid item xs={8} md={8}>
                        {moment(subscriptionData.mollieSubscription.nextPaymentDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                      </Grid>
                      </React.Fragment>
                    }
                    {subscriptionData.subscription.subStatus === 'EXPIRED' && 
                      <Grid item xs={8} md={8}>
                        <div className={classes.statusOK}>
                          Terminé
                        </div>
                      </Grid>
                    }
                    {(subscriptionData.subscription.subStatus === 'CANCELED_BY_ADMIN' ||  subscriptionData.subscription.subStatus === 'CANCELED_BY_CLIENT') &&
                      <Grid item xs={8} md={8}>
                        <div className={classes.statusKO}>
                         Annulé
                        </div>
                      </Grid>
                    }
                  </Grid>
                  <ExpansionPanel className={classes.expansionPanel}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMore />}
                      id="expandMore"
                    >
                      <Typography>Informations sur vos cours</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Container component="main" maxWidth="xl">
                        {sortLessons(subscriptionData.subscription.lessons).map(lesson => (
                          <React.Fragment key={lesson.id}>
                          <Typography component="h6" variant="h6" className={classes.typoLessonTitle}>
                            {lesson.name}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4} md={4}>
                              Type:
                            </Grid>
                            <Grid item xs={8} md={8}>
                              {lesson.lessonType.simpleName}
                            </Grid>
                            <Grid item xs={4} md={4}>
                              Sous-Type:
                            </Grid>
                            <Grid item xs={8} md={8}>
                              {lesson.lessonSubType.simpleName}
                            </Grid>
                            <Grid item xs={4} md={4}>
                              Début:
                            </Grid>
                            <Grid item xs={8} md={8}>
                              {moment(lesson.recurenceBegin).format('DD/MM/YYYY')}
                            </Grid>
                            <Grid item xs={4} md={4}>
                              Fin:
                            </Grid>
                            <Grid item xs={8} md={8}>
                              {moment(lesson.recurenceEnd).format('DD/MM/YYYY')}
                            </Grid>
                            <Grid item xs={4} md={4}>
                              Heure:
                            </Grid>
                            <Grid item xs={8} md={8}>
                              {moment(lesson.recurenceBegin).format('HH:mm')} - {moment(lesson.recurenceEnd).format('HH:mm')}
                            </Grid>
                          </Grid>
                          </React.Fragment>
                        ))}
                      </Container>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  <CardActions>
                    {subscriptionData.mollieSubscription.status === 'suspended' && (
                      <IconButton onClick={correctPayment(subscriptionData)}>
                        <Money />
                      </IconButton>
                    )}
                  </CardActions>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
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
    </div>
  )
}