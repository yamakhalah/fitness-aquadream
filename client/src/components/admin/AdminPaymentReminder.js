
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Loader from '../global/Loader'
import { useQuery, useMutation } from  'react-apollo'
import { Snackbar, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton, Container, CssBaseline, Tooltip } from '@material-ui/core';
import MaterialTable from 'material-table'
import { GET_PAYMENTS_REMINDER } from '../../database/query/paymentReminderQuery'
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
  const [selectedPaymentReminder, setSelectedPaymentReminder] = React.useState(null)
  const [selectedIndex, setSelectedIndex] = React.useState(null)
  const [openSnack, setOpenSnack] =  React.useState(null)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorVariant, setErrorVariant] = React.useState('error')
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

  const {loading, error, data } = useQuery(
    GET_PAYMENTS_REMINDER,
    {
      onCompleted: (newData) => {
        var lRows = []
        for(const paymentReminder of newData.paymentsReminder) {
          lRows.push({
            id: paymentReminder.id,
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

  if(loading) return (
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
        />
      </Container>
    </div>
  )
}