import React, { useEffect } from 'react'
import Loader from '../global/Loader'
import { makeStyles } from '@material-ui/core/styles'
import { Snackbar, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, TablePagination, Container, CssBaseline, Typography, Table, TableRow, TableCell, TableBody, TableHead } from '@material-ui/core'
import { Edit, ExpandMore, ArrowForward } from '@material-ui/icons'
import { useQuery, useMutation, useApolloClient } from  'react-apollo'
import { dateToDayString } from '../../utils/dateTimeConverter'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { GET_SUBSCRIPTIONS } from '../../database/query/subscriptionQuery'
import { GET_MOLLIE_SUBSCRIPTION_DATA } from '../../database/query/payementQuery'
import { GET_LESSONS_WAITING_OR_GOING_FREE } from '../../database/query/lessonQuery'
import { CHANGE_LESSON } from '../../database/mutation/subscriptionMutation'
import moment from 'moment'

moment.locale('fr')

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: 25,
    backgroundColor: 'white',
    paddingTop: 30,
    paddingBottom: 30
  },

  formControl: {
    minWidth: '100%',
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh'
  },

  table: {
    marginTop: 25
  },
  container: {
    textAlign: 'center'
  },
  inline: {
    display: 'inline-block'
  },
  typography: {
    paddingBottom: theme.spacing(2)
  }
}))

export default function AdminSubscription() {
  const classes = useStyles()
  const [client, setClient] = React.useState(useApolloClient())
  const [loading, setLoading] = React.useState(true)
  const [subscriptionsData, setSubscriptionsData] = React.useState([])
  const [lessonsData, setLessonsData] = React.useState([])
  const [selectedSubscriptionData, setSelectedSubscriptionData] = React.useState(null)
  const [selectedOldLesson, setSelectedOldLesson] = React.useState(null)
  const [selectedNewLesson, setSelectedNewLesson] = React.useState(null)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [page, setPage] = React.useState(0)
  const [openEditDialog, setOpenEditDialog] = React.useState(false)
  const [openSnack, setOpenSnack] = React.useState(false)
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')

  const { load, error, data } = useQuery(GET_SUBSCRIPTIONS, { fetchPolicy: 'network-only' })

  const initLessonsData = (data) => {
    setLessonsData(data.lessonsWaitingOrGoingFree)
  }

  useQuery(GET_LESSONS_WAITING_OR_GOING_FREE, { fetchPolicy: 'network-only' , onCompleted: initLessonsData }) 

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
        setSelectedSubscriptionData(lSubscriptionsData[0])
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
    }
  }, [data])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const sortSubscriptions = (subscriptions) => {
    return subscriptions.sort((a,b) => Date.parse(a.subscription.created) - Date.parse(b.subscription.created))
  }

  const handleEditDialog = (subscriptionData) => {
    if(!openEditDialog) {
      setSelectedSubscriptionData(subscriptionData)
      setOpenEditDialog(true)
    }else{
      setOpenEditDialog(false)
    }
  }

  const modifyLesson = () => {
    setLoading(true)
    client.mutate({
      mutation: CHANGE_LESSON,
      variables: {
        subscription: selectedSubscriptionData.subscription.id,
        oldLesson: selectedOldLesson.id,
        newLesson: selectedNewLesson.id
      }
    })
    .then(result => {
      if(result.data.changeLesson) {
        showSnackMessage('L\'abonnement a bien été modifié', 'success')
      }else{
        showSnackMessage('Une erreur s\'est produite durant la modification', 'error')
      }
      setLoading(false)
      setOpenEditDialog(false)
    })
    .catch(error => {
      console.log(error)
      showSnackMessage('Une erreur s\'est produite durant la modification', 'error')
      setLoading(false)
      setOpenEditDialog(false)
    })
  }

  const showSnackMessage = (message, type) => {
    setErrorMessage(message)
    setErrorVariant(type)
    setOpenSnack(true)
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
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
              <React.Fragment key={subscriptionData.subscription.id}>
                <TableRow>
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
                    <TableCell>
                      <Tooltip title="Modifier l'abonnement">
                        <IconButton onClick={() => handleEditDialog(subscriptionData)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className={classes.cell} />
                  <TableCell colSpan={7} className={classes.cell}>
                    <ExpansionPanel>
                      <ExpansionPanelSummary
                        expandIcon={<ExpandMore />}
                        id="expandMore"
                      >
                        <Typography>Informations sur les cours</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Container component="main" maxWidth="xl" className={classes.container}>
                          {subscriptionData.subscription.lessons.map(lesson => (
                            <React.Fragment key={lesson.id}>
                              <Grid item xs={6} md={6} className={classes.inline}>
                                <Typography component="h6" variant="h6" className={classes.typography}>
                                  {lesson.name}
                                </Typography>
                                <Grid container spacing={2}>
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
                                    Jour:
                                  </Grid>
                                  <Grid item xs={8} md={8}>
                                    {dateToDayString(moment(lesson.recurenceBegin))}
                                  </Grid>
                                  <Grid item xs={4} md={4}>
                                    Heure:
                                  </Grid>
                                  <Grid item xs={8} md={8}>
                                    {moment(lesson.recurenceBegin).format('HH:mm')} - {moment(lesson.recurenceEnd).format('HH:mm')}
                                  </Grid>
                                </Grid>
                              </Grid>
                            </React.Fragment>
                          ))}
                        </Container>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          rowsPerPageOptions={[10]}
          colSpan={3}
          count={subscriptionsData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
          }}
          onChangePage={handleChangePage}
        />
      </Container>
      <Dialog open={openEditDialog} fullWidth={true} maxWidth='md'>
        <DialogTitle>Modifier un abonnement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl required variant="outlined" className={classes.formControl}>
                <InputLabel id="lessonType">Cours à changer</InputLabel>
                  <Select
                    labelId="subLessons"
                    id="subLessons"
                    value={selectedOldLesson ? selectedOldLesson : ''}
                    name="subLessons"
                    label="Cours à changer"
                    labelWidth={80}
                    onChange={event => {
                      setSelectedOldLesson(event.target.value)
                  }}
                  >
                  <MenuItem value={selectedOldLesson ? selectedOldLesson : '' } disabled>
                    {selectedOldLesson ? (selectedOldLesson.name +' '+dateToDayString(selectedOldLesson.recurenceBegin)+' '+ moment(selectedOldLesson.recurenceBegin).format('HH:mm')) : ''}
                  </MenuItem>
                  {selectedSubscriptionData.subscription.lessons.map(lesson =>               
                    <MenuItem key={lesson.id} value={lesson}>{(lesson.name +' '+dateToDayString(lesson.recurenceBegin)+' '+ moment(lesson.recurenceBegin).format('HH:mm'))}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl required variant="outlined" className={classes.formControl}>
                <InputLabel id="lessonType">Nouveau cours</InputLabel>
                  <Select
                    labelId="newLessons"
                    id="newLessons"
                    value={selectedNewLesson ? selectedNewLesson : ''}
                    name="newLessons"
                    label="Nouveau cours"
                    labelWidth={80}
                    onChange={event => {
                      setSelectedNewLesson(event.target.value)
                  }}
                  >
                  <MenuItem value={selectedNewLesson ? selectedNewLesson : '' } disabled>
                    {selectedNewLesson ? (selectedNewLesson.name +' '+dateToDayString(selectedNewLesson.recurenceBegin)+' '+ moment(selectedNewLesson.recurenceBegin).format('HH:mm')) : ''}
                  </MenuItem>
                  {lessonsData.map(lesson =>               
                    <MenuItem key={lesson.id} value={lesson}>{(lesson.name +' '+dateToDayString(lesson.recurenceBegin)+' '+ moment(lesson.recurenceBegin).format('HH:mm'))}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={5} className={classes.container}>
              <Grid item xs={12}>
                {selectedOldLesson ? selectedOldLesson.name : ''}
              </Grid>
              <Grid item xs={12}>
                {selectedOldLesson ? dateToDayString(selectedOldLesson.recurenceBegin) : ''}
              </Grid>
              <Grid item xs={12}>
                {selectedOldLesson ? moment(selectedOldLesson.recurenceBegin).format('HH:mm') : ''}
              </Grid>
            </Grid>
            <Grid item xs={2} className={classes.container}>
              <ArrowForward />
            </Grid>
            <Grid item xs={5} className={classes.container}>
              <Grid item xs={12}>
                {selectedNewLesson ? selectedNewLesson.name : ''}
              </Grid>
              <Grid item xs={12}>
                {selectedNewLesson ? dateToDayString(selectedNewLesson.recurenceBegin) : ''}
              </Grid>
              <Grid item xs={12}>
                {selectedNewLesson ? moment(selectedNewLesson.recurenceBegin).format('HH:mm') : ''}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEditDialog(null)} color="default" disabled={loading}>
            Annuler           
          </Button>
          <Button onClick={() => modifyLesson()} color="primary" disabled={loading}>
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

