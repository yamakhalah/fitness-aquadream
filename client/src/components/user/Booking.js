import React, { useEffect } from 'react'
import moment from 'moment-timezone'
import Loader from '../global/Loader.js'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useApolloClient, useQuery } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { Fab, Grid, CssBaseline, Paper, Button, Typography, Stepper, StepLabel, Step } from '@material-ui/core';
import { GET_USER_BY_ID } from '../../database/query/userQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { GET_SESSION } from '../../database/query/payementQuery'
import { PRE_SUBSCRIBE_TO_LESSONS } from '../../database/mutation/paymentMutation'
import LessonPicker from './BookingSubComponents/LessonPicker'
import OrderResume from './BookingSubComponents/OrderResume'
import Payement from './BookingSubComponents/Payement'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

const useStyles = makeStyles(theme => ({
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(1000 + theme.spacing(2) * 2)]: {
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
    paddingTop: theme.spacing(2),
    [theme.breakpoints.up(1000 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(0),
      marginBottom: theme.spacing(6),
      paddingTop: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(2)
  },
  total: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: theme.spacing(2)
  },
  button: {
    marginTop: theme.spacing(0),
    marginLeft: theme.spacing(1),
  },
  noPadding: {
    paddingLeft: 0
  },
  loader: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fab: {
    position: 'fixed',
    color: '#FFFFFF',
    bottom: theme.spacing(5),
    right: theme.spacing(5),
    zIndex: 9999
  }
}))

export default function Booking() {
  const classes = useStyles()
  const history = useHistory()
  const steps = ['Sélection des cours', 'Votre Commande', 'Paiement']
  const [client, setClient] = React.useState(useApolloClient())
  const [activeStep, setActiveStep] = React.useState(0)
  const [bookedLessons, setBookedLessons] = React.useState([])
  const [preBookedLessons, setPreBookedLessons] = React.useState([])
  const [orderResume, setOrderResume] = React.useState({})
  const [user, setUser] = React.useState(null)
  const [totalPrice, setTotalPrice] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [nextButtonDisable, setNextButtonDisable] = React.useState(true)

  const Authentification = useQuery(GET_AUTHENTIFICATION)

  useEffect(() => {
    if(!Authentification.loading){
      client.query({
        query: GET_USER_BY_ID,
        fetchPolicy: 'network-only',
        variables: {
          id: Authentification.data.Authentification.userID
        }
      })
      .then(result => {
        setUser(result.data.user)
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
    }
  }, [Authentification.data, Authentification.loading, loading])

  function getStepContent(step) {
    switch(step) {
      case 0:
        return <LessonPicker handleChangeCallback={lessonPickerCallback} />
      case 1: 
        return <OrderResume handleFinalPriceCallBack={orderResumeCallBack} preBookedLessons={preBookedLessons} bookedLessons={bookedLessons} fUser={getUser} />
      case 2:
        setLoading(true)
        if(bookedLessons.length === 0) {
          noBookingCheckout()
        }else{
          checkout()
        }
    }
  }

  const checkout = () => {
    client.query({
      query: GET_SESSION,
      variables: {
        orderResume: orderResume,
        preBookedLessons: preBookedLessons,
        user: user
      }
    })
    .then(result => {      
      window.location = result.data.getSession._links.checkout.href
    })
    .catch(error => {
      console.log(error)
    })
  }

  const noBookingCheckout = () => {
    client.mutate({
      mutation: PRE_SUBSCRIBE_TO_LESSONS,
      variables: {
        preBookedLessons: preBookedLessons,
        user: user
      }
    })
    .then(result => {
      history.push({
        pathname: '/booking/checkout/prebooked',
      })
    })
    .catch(error => {
      console.log(error)
    })
  }

  const getOrderResume = () => {
    return orderResume
  }

  const getUser = () => {
    return user
  }

  const orderResumeCallBack = (orderResume) => {
    setOrderResume(orderResume)
  } 

  const lessonPickerCallback = (bookedLessons, preBookedLessons) => {
    setBookedLessons(bookedLessons)
    setPreBookedLessons(preBookedLessons)

    var total = 0
    bookedLessons.forEach(lesson => {
      total += lesson.pricing.totalPrice
    });
    setTotalPrice(total)
    if(bookedLessons.length > 0 || preBookedLessons.length > 0) {
      setNextButtonDisable(false)
    }else{
      setNextButtonDisable(true)
    }
  }

  const handleNext = () => {
    setActiveStep(activeStep+1)
  }

  const handleBack = () => {
    setActiveStep(activeStep-1)
  }

  if(loading) return (
    <div className={classes.loader}>
      <Loader />
    </div>
  )
  else if(true) return (
    <div className={classes.loader}>
      <h2>En raison du COVID-19 il n'est pour l'instant pas possible de réserver des cours. Info: contact@aquadream-temploux.be</h2>
    </div>
  )
  else
  return (
    <React.Fragment>
      {activeStep === 0 && (
      <Fab 
        variant="extended"
        size="small"
        color="secondary"
        aria-label="Commander"
        className={classes.fab}
        disabled={bookedLessons.length === 0 && preBookedLessons.length === 0}
        onClick={handleNext}
      >
        Commander
      </Fab>
      )}
      <CssBaseline />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            Réservation
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
              
              </React.Fragment>
            ):(
              <React.Fragment>
                {getStepContent(activeStep)}
                <Grid container>
                  <Grid item xs={6} sm={6}>
                    <div className={classes.total}>
                      {activeStep === 0 && (
                        <p><strong>{preBookedLessons.length}</strong> pré-inscriptions et <strong>{bookedLessons.length}</strong> inscriptions pour un total de <strong>{totalPrice}€</strong></p>
                      )}
                    </div> 
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <div className={classes.buttons}>
                      {(activeStep !== 0 && activeStep !== 2) && (
                        <Button onClick={handleBack} className={classes.button}>
                          Retour
                        </Button>
                      )}
                      {activeStep !== 2 && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          className={classes.button}
                          disabled={nextButtonDisable}
                        >
                          {activeStep === steps.length - 1 ? 'Payer' : 'Suivant'}
                        </Button>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </main>
    </React.Fragment>
  )
}