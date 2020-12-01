
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Loader from '../global/Loader'
import { useQuery, useApolloClient } from  'react-apollo'
import { Snackbar, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton, Container, CssBaseline, Tooltip } from '@material-ui/core';
import { MailOutline, Done } from '@material-ui/icons'
import { CustomSnackBar } from '../global/CustomSnackBar'
import MaterialTable from 'material-table'
import { GET_PAYMENTS_REMINDER, SEND_PAYMENTS_REMINDER_EMAIL } from '../../database/query/paymentReminderQuery'
import { VALIDATE_PAYMENT } from '../../database/mutation/paymentReminderMutation'
import moment from 'moment-timezone'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

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

  errorText: {
    color: 'red'
  },

  redIcon: {
    color: "red"
  },

  greenIcon: {
    color: "green"
  },

  formControl: {
    minWidth: '100%',
  },
}))

export default function AdminPaymentReminder(props) {
  const classes = useStyles()
  const [client, setClient] = React.useState(useApolloClient())
  const [selectedPaymentReminder, setSelectedPaymentReminder] = React.useState(null)
  const [selectedIndex, setSelectedIndex] = React.useState(null)
  const [openSnack, setOpenSnack] =  React.useState(null)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [loading, setLoading] = React.useState(true)
  const [columns,] = React.useState([
    { title: 'Identifiant', field: 'id' },
    { title: 'Utilisateur', field: 'user' },
    { title: 'Email', field: 'email' },
    { title: 'Téléphone', field: 'phone' },
    { title: 'Montant', field: 'amount' },
    { title: 'Date d\'échec de paiement', field: 'dueDate' },
    { title: 'Date limite de paiement', field: 'limitDate' },
    { title: 'Status', field: 'status' },
  ])
  const [rows, setRows] = React.useState([])

  const {loadingQuery, error, data } = useQuery(
    GET_PAYMENTS_REMINDER,
    {
      onCompleted: (newData) => {
        var lRows = []
        for(const paymentReminder of newData.paymentsReminder) {
          lRows.push({
            id: paymentReminder.id,
            userID: paymentReminder.user.id,
            user: paymentReminder.user.firstName+' '+paymentReminder.user.lastName,
            email: paymentReminder.user.email,
            phone: paymentReminder.user.phone,
            amount: paymentReminder.amount+'€',
            dueDate: moment(paymentReminder.dueDate).format('DD-MM-YYYY'),
            limitDate: moment(paymentReminder.limitDate).format('DD-MM-YYYY'),
            status: paymentReminder.resolved ? 'Payé' : 'Non payé'
          })
        }
        setRows(sortPayments(lRows))
        setLoading(false)
      }
    }
  )

  const sortPayments = (payments) => {
    return payments.sort((a,b) => {
      if(a.resolved) return 1
      else if(!a.resolved) return -1
      return 0
    })
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
  }

  const validatePayment = (rowData) => {
    setLoading(true)
    client.mutate({
      mutation: VALIDATE_PAYMENT,
      variables: { id: rowData.id },
      refetchQueries: [{
        query: GET_PAYMENTS_REMINDER
      }]
    })
    .then(result => {
      if(result.data.sendReminderEmail) {
        showSnackMessage('Rappel de paiement validé !', 'success')
      }else{
        showSnackMessage('Une erreur s\'est produite durant la validation', 'error')
      }
      setLoading(false)
    })
    .catch(error => {
      console.log(error)
      showSnackMessage('Une erreur s\'est produite durant la validation', 'error')
      setLoading(false)
    })
  }

  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }

  const sendReminderEmail = (rowData) => {
    setLoading(true)
    client.query({
      query:  SEND_PAYMENTS_REMINDER_EMAIL,
      variables: {
        user: rowData.userID,
        paymentReminder: rowData.id
      },
      refetchQueries: [{
        query: GET_PAYMENTS_REMINDER
      }]
    })
    .then(result => {
      if(result.data.sendReminderEmail) {
        showSnackMessage('Un email a été envoyé !', 'success')
      }else{
        showSnackMessage('Une erreur s\'est produite durant l\'envoi', 'error')
      }
      setLoading(false)
    })
    .catch(error => {
      console.log(error)
      showSnackMessage('Une erreur s\'est produite durant l\'envoi', 'error')
      setLoading(false)
    })
  }

  if(loadingQuery || loading) return (
    <div className={classes.loader}>
      <Loader />
    </div>
  )

  return (
    <div>
      <Container component="main" maxWidth="xl" className={classes.root}>
      <CssBaseline />
        <MaterialTable
          title="Liste des recouvrements"
          columns={columns}
          data={rows}
          options={{
              filtering: true
          }}
          actions={[
            rowData => ({
              icon: () =>  <MailOutline />,
              tooltip: 'Envoyer un rappel',
              onClick: (event, rowData) => sendReminderEmail(rowData),
              disabled: rowData.status === 'Payé'
            }),
            rowData => ({
              icon: () => <Done />,
              tooltip: 'Valider le paiement',
              onClick: (event, rowData) => validatePayment(rowData),
              disabled: rowData.status === 'Payé'
            })
          ]}
        />
      </Container>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={openSnack}
        autoHideDuration={5000}
        onClose={handleSnackClose}
      >
        <CustomSnackBar
          onClose={handleSnackClose}
          variant={errorVariant}
          message={errorMessage}
        />
      </Snackbar>
    </div>
  )
}