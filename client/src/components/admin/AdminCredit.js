import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Loader from '../global/Loader'
import { useQuery, useMutation } from  'react-apollo'
import { GET_CREDITS_VALIDITY } from '../../database/query/creditQuery'
import { INVALIDATE_CREDIT, UPDATE_CREDIT } from '../../database/mutation/creditMutation'
import MaterialTable from 'material-table'
import { Snackbar, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton, TableBody, TableRow, TableCell, Container, CssBaseline , Typography, Table, TableHead, Tooltip, Grid } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { CustomSnackBar } from '../global/CustomSnackBar'
import DateFnsUtils from '@date-io/date-fns'
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

export default function AdminCredit(props) {
  const classes = useStyles()
  const [credits, setCredits] = React.useState([]);
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [dialogLoading,] = React.useState(false)
  const [selectedCredit, setSelectedCredit] = React.useState(null)
  const [selectedIndex, setSelectedIndex] = React.useState(null)
  const [openSnack, setOpenSnack] =  React.useState(null)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [columns,] = React.useState(
    [
      { title: 'utilisateur', field: 'user' },
      { title: 'Type', field: 'type' },
      { title: 'Sous-Type', field: 'subType' },
      { title: 'Utilisé ?', field: 'isUsed' },
      { title: 'Date de validité', field: 'validityDate' },
    ]
  )
  const [rows, setRows] = React.useState([])
  const [invalidateCredit] = useMutation(
    INVALIDATE_CREDIT,
    {
      onCompleted: (result) => {
        var lRows = [...rows]
        lRows.splice(selectedIndex, 1)
        setRows(sortCredits(lRows))
        showSnackMessage("Le crédit a bien  été invalidé", "success")
        closeDeleteDialog()
      },
      onError: (error) => {
        showSnackMessage("Erreur lors de la suppression du credit", "error")
        closeDeleteDialog()
      }
    })
  const [updateCredit] = useMutation(
    UPDATE_CREDIT,
    {
      onCompleted: (result) => {
        var lRows = [...rows]
        lRows[selectedIndex] = selectedCredit
        setRows(sortCredits(lRows))
        showSnackMessage("Le crédit a bien  été modifié", "success")
        closeEditDialog()
      },
      onError: (error) => {
        showSnackMessage("Erreur lors de la modification du crédit", "error")
        closeEditDialog()
      }
    }
  )

  const { loading, error, data, fetchMore } = useQuery(
    GET_CREDITS_VALIDITY, 
    {
      onCompleted: (newData) => { 
        var lRows = []
        for(const credit of newData.creditsValidity){
          lRows.push({
            user: credit.user.firstName,
            type: credit.lessonDay.lesson.lessonType.simpleName,
            subType: credit.lessonDay.lesson.lessonSubType.simpleName,
            isUsed: credit.isUsed ? 'Oui' : 'Non',
            validityDate: moment(credit.validityEnd).format('DD/MM/YYYY'),
            credit: credit
          })
        }
        setRows(sortCredits(lRows))
      }
    }
  )

  const openEditDialog = (credit, index) => {
    setSelectedCredit(credit)
    setSelectedIndex(index)
    setEditOpen(true)
  }

  const closeEditDialog = () => {
    setEditOpen(false)
  }

  const openDeleteDialog = (credit, index) => {
    setSelectedCredit(credit)
    setSelectedIndex(index)
    setDeleteOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteOpen(false)
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
  }
  
  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }
  

  const sortCredits = (credits) => {
    return credits.sort((a,b) => Date.parse(a.validityEnd) - Date.parse(b.validityEnd))
  }

  if (loading || dialogLoading) return (
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
      <MaterialTable
        title="Liste des crédits"
        columns={columns}
        date={rows}
        actions={[
          rowData => ({
            icon: () => <Edit />,
            tooltip: 'Modifier le crédit',
            onClick: (event, rowData) => openEditDialog.bind(this, rowData.credit, rowData.tableData.id),
            disabled: rowData.isUsed
          }),
          rowData => ({
            icon: () => <Delete />,
            tooltip: 'Invalider le crédit',
            onClick: (event, rowData) => openDeleteDialog.bind(this, rowData.credit, rowData.tableData.id),
            disabled: rowData.isUsed
          })
        ]}
        options={{
            filtering: true
        }}
      />
      </Container>
      <Dialog open={deleteOpen}>
        <DialogTitle>Invalider le crédit</DialogTitle> 
        <DialogContent>
          <Typography>Êtes-vous certains de vouloir invalider ce crédit ?</Typography>
        </DialogContent>  
        <DialogActions>
          <Button onClick={closeDeleteDialog.bind(this)}>
            Annuler 
          </Button>
          <Button color="primary" onClick={e => {
            e.preventDefault()
            invalidateCredit({ 
              variables: { id: selectedCredit.id },
              refetchQueries: [{ query: GET_CREDITS_VALIDITY }]
            })
          }}>
            Confirmer
          </Button>
        </DialogActions>    
      </Dialog>
      <Dialog open={editOpen}>
        <DialogTitle>Modifier le crédit</DialogTitle>
        <DialogContent>
          <Container component="main" maxWidth="md" className={classes.container}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={12} md={12}>
                  <KeyboardDatePicker
                    required
                    name="validityDate"
                    margin="normal"
                    id="validityDate"
                    label="Date de validité"
                    format="dd/MM/yyyy"
                    minDate={moment()}
                    value={selectedCredit ? selectedCredit.validityEnd : moment()}
                    onChange={event => {
                      var credit = {...selectedCredit}
                      credit.validityEnd = moment(event, 'DD/MM/YYYY').toISOString(true)
                      setSelectedCredit(credit)
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'Sélectionner date'
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>
            Annuler 
          </Button>
          <Button color="primary" onClick={ e => {
            e.preventDefault()
            updateCredit({
              variables: {
                id: selectedCredit.id,
                user: selectedCredit.user.id,
                lessonDay: selectedCredit.lessonDay.id,
                isUsed: selectedCredit.isUsed,
                validityEnd: selectedCredit.validityEnd
              },
              refetchQueries: [{ query:  GET_CREDITS_VALIDITY }]
            })
          }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
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