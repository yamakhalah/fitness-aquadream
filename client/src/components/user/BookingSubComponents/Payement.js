import React, { useEffect } from 'react'
import moment from 'moment'
import axios from 'axios'
//import chargebee from 'chargebee'
import { useHistory } from 'react-router-dom'
import { Container, CssBaseline, Typography, Grid } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useApolloClient } from 'react-apollo'

//chargebee.configure({site : "digital-production-test"}

const useStyles = makeStyles(theme => ({
  loader: {
    textAlign: 'center'
  },
}))

const Payement = () => {
  const classes = useStyles()
  
  
  useEffect(() => {
    console.log('TESTTEST')
  })



  /*
  const openCheckout = (session) => {
    stripe.redirectToCheckout({
      sessionId: session.id
    }).then((result) => {
      console.log(result)
    })
  }

  /*
  const openCheckout = (hostedPage) => {
    console.log('OPEN CHECKOUT')
    console.log(hostedPage)
    cbInstance.openCheckout({
      hostedPage: function getHostedPagePromise(){
        return new Promise((resolve, reject) => {
          resolve(hostedPage)
        }) 
      },
      success: (hostedPageID) => {
        console.log('success')
        console.log(hostedPageID)
      },
      error: (error) => {
        console.log(error)
      },
      close:() => {
        console.log('Checkout closed')
      },
      step(step) {
        console.log('checkout', step)
      }
    })
  }
  */
  

  return (
    <React.Fragment>
      COUCOU
    </React.Fragment>
  )

}

export default Payement


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