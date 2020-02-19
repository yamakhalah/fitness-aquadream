import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Loader from '../global/Loader'
import { useQuery, useMutation } from  '@apollo/react-hooks'
import { GET_CREDITS_VALIDITY } from '../../database/query/creditQuery'
import { INVALIDATE_CREDIT, UPDATE_CREDIT } from '../../database/mutation/creditMutation'
import { Snackbar, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton, TableBody, TableRow, TableCell, Container, CssBaseline , Typography, Table, TableHead, Tooltip, Grid } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { CustomSnackBar } from '../global/CustomSnackBar'
import DateFnsUtils from '@date-io/date-fns'
import { lessonTypeToString, lessonSubTypeToString } from '../../utils/enumToString'
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
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [selectedCredit, setSelectedCredit] = React.useState(null)
  const [openSnack, setOpenSnack] =  React.useState(null)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [validityEnd, setValidityEnd] = React.useState(moment())
  const [invalidateCredit] = useMutation(
    INVALIDATE_CREDIT,
    {
      onCompleted: (result) => {
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
        showSnackMessage("Le crédit a bien  été modifié", "success")
        closeEditDialog()
      },
      onError: (error) => {
        showSnackMessage("Erreur lors de la modification du crédit", "error")
        closeEditDialog()
      }
    }
  )

  const openEditDialog = (credit) => {
    setSelectedCredit(credit)
    setValidityEnd(moment(credit.validityEnd))
    setEditOpen(true)
  }

  const closeEditDialog = () => {
    setEditOpen(false)
  }

  const openDeleteDialog = (credit) => {
    setSelectedCredit(credit)
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

  const { loading, error, data } = useQuery(GET_CREDITS_VALIDITY)

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
        Liste des crédits valides
      </Typography>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Sous-Type</TableCell>
              <TableCell>Utilisé ?</TableCell>
              <TableCell>Date de validity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortCredits(data.creditsValidity).map(credit => (
              <TableRow key={credit.id}>
                <TableCell component="th" scope="row">{credit.user.firstName} {credit.user.lastName}</TableCell>
                <TableCell>{credit.lessonDay.lesson.lessonType.simpleName}</TableCell>
                <TableCell>{credit.lessonDay.lesson.lessonSubType.simpleName}</TableCell>
                <TableCell>{credit.isUsed ? 'Oui' : 'Non'}</TableCell>
                <TableCell>{moment(credit.validityEnd).format('DD/MM/YYYY')}</TableCell>
                <TableCell>
                  {!credit.isUsed &&
                      <Tooltip title="Modifier le crédit">
                        <IconButton className={classes.greenIcon} onClick={openEditDialog.bind(this, credit)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      }
                      <Tooltip title="Invalider le crédit">
                        <IconButton className={classes.redIcon} onClick={openDeleteDialog.bind(this, credit)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                    value={validityEnd}
                    onChange={event => setValidityEnd(moment(event, 'DD/MM/YYYY'))}
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
                validityEnd: validityEnd.toISOString(true)
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