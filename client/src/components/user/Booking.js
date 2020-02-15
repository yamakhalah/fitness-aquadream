import React, { useEffect } from 'react'
import moment from 'moment'
import Loader from '../global/Loader.js'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useApolloClient, useQuery } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { Grid, CssBaseline, Paper, Button, Typography, Stepper, StepLabel, Step } from '@material-ui/core';
import { GET_USER_BY_ID } from '../../database/query/userQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { GET_SESSION } from '../../database/query/payementQuery'
import LessonPicker from './BookingSubComponents/LessonPicker'
import OrderResume from './BookingSubComponents/OrderResume'
import Payement from './BookingSubComponents/Payement'

moment.locale('fr')

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
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    paddingTop: theme.spacing(2),
    [theme.breakpoints.up(1000 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
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
    textAlign: 'center'
  },
}))

export default function Booking() {
  const classes = useStyles()
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
        checkout()
    }
  }

  const checkout = () => {
    client.query({
      query: GET_SESSION,
      variables: {
        orderResume: orderResume,
        user: user
      }
    })
    .then(result => {
      console.log(result)      
      window.location = result.data.getSession._links.checkout.href
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
  else
  return (
    <React.Fragment>
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
                      {activeStep !== 0 && (
                        <Button onClick={handleBack} className={classes.button}>
                          Retour
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}
                        disabled={nextButtonDisable}
                      >
                        {activeStep === steps.length - 1 ? 'Payer' : 'Suivant'}
                      </Button>
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