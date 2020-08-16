import React, { useEffect } from 'react'
import Loader from '../global/Loader'
import { makeStyles } from '@material-ui/core/styles'
import { Snackbar, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, TablePagination, Container, CssBaseline, Typography, Table, TableRow, TableCell, TableBody, TableHead, FormLabel, RadioGroup, Radio, FormControlLabel } from '@material-ui/core'
import { Edit, ExpandMore, ArrowForward, Delete, Info } from '@material-ui/icons'
import { useQuery, useApolloClient } from  'react-apollo'
import { dateToDayString } from '../../utils/dateTimeConverter'
import { CustomSnackBar } from '../global/CustomSnackBar'
import MaterialTable from 'material-table'
import { GET_SUBSCRIPTIONS } from '../../database/query/subscriptionQuery'
import { GET_MOLLIE_SUBSCRIPTION_DATA } from '../../database/query/payementQuery'
import { GET_LESSONS_WAITING_OR_GOING_FREE } from '../../database/query/lessonQuery'
import { CHANGE_LESSON, CANCEL_SUBSCRIPTION_DISCOUNT, PRE_CANCEL_SUBSCRIPTION } from '../../database/mutation/subscriptionMutation'
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
  const [columns,] = React.useState(
    [
      { title: 'ID', field: 'id' },
      { title: 'Utilisateur', field: 'user' },
      { title: 'Création', field: 'created' },
      { title: 'Total Cours', field: 'totalLessons' },
      { title: 'Statut Abonnement', field: 'subStatus',
        lookup: { 'WAITING_PAYEMENT': 'En attente de paiement', 'WAITING_BEGIN': 'En attente', 'ON_GOING': 'En Cours' }
      },
      { title: 'Jour', field: 'day' },
      { title: 'Début', field: 'begin' },
      { title: 'Fin', field: 'end' },
      { title: 'Prix Total', field: 'total' },
      { title: 'Prix Mensuel', field: 'totalMonthly' },
      { title: 'Status Paiement', field: 'paymentStatus' },
    ])
  const [rows, setRows] = React.useState([])
  const [lessonsData, setLessonsData] = React.useState([])
  const [selectedSubscriptionData, setSelectedSubscriptionData] = React.useState(null)
  const [selectedOldLesson, setSelectedOldLesson] = React.useState(null)
  const [selectedNewLesson, setSelectedNewLesson] = React.useState(null)
  const [refundType, setRefundType] = React.useState('discount')
  const [openEditDialog, setOpenEditDialog] = React.useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
  const [openInfosDialog, setOpenInfosDialog] = React.useState(false)
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
      var lRows = []
      var promises = []
      for(const subscription of data.subscriptions) {
        if(subscription.subStatus !== 'WAITING_PAYEMENT' && subscription.subStatus !== 'CANCELED_BY_ADMIN'){   
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
              lRows.push({
                id: subscription.id,
                user: subscription.user.firstName+' '+subscription.user.lastName,
                created: moment(subscription.created).format('DD/MM/YYYY HH:mm'),
                totalLessons: subscription.lessons.length,
                subStatus: subscription.subStatus,
                day: dateToDayString(subscription.validityBegin),
                begin: moment(subscription.validityBegin).format('DD/MM/YYYY'),
                end: moment(subscription.validityEnd).format('DD/MM/YYYY'),
                total: subscription.total,
                totalMonthly: subscription.totalMonth,
                paymentStatus: result.data.getMollieSubscriptionData.status,
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
        }else if(subscription.subStatus === 'WAITING_PAYEMENT'){
          lRows.push({
            id: subscription.id,
            user: subscription.user.firstName+' '+subscription.user.lastName,
            created: moment(subscription.created).format('DD/MM/YYYY HH:mm'),
            totalLessons: subscription.lessons.length,
            subStatus: subscription.subStatus,
            day: dateToDayString(subscription.validityBegin),
            begin: moment(subscription.validityBegin).format('DD/MM/YYYY'),
            end: moment(subscription.validityEnd).format('DD/MM/YYYY'),
            total: subscription.total,
            totalMonthly: subscription.totalMonth,
            paymentStatus: 'Non payé',
            subscription: subscription,
            mollieSubscription: null
          })
        }
      }
      Promise.all(promises.map(p => p.catch(e => e)))
      .then(result => {
        setRows(lRows)
        setSelectedSubscriptionData(lRows[0])
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

  const handleInfosDialog = (subscriptionData) => {
    if(!openInfosDialog) {
      setSelectedSubscriptionData(subscriptionData)
      setOpenInfosDialog(true)
    }else{
      setOpenInfosDialog(false)
    }
  }

  const handleEditDialog = (subscriptionData) => {
    if(!openEditDialog) {
      setSelectedSubscriptionData(subscriptionData)
      setOpenEditDialog(true)
    }else{
      setOpenEditDialog(false)
    }
  }
  
  const handleDeleteDialog = (subscriptionData) => {
    if(!openDeleteDialog) {
      setSelectedSubscriptionData(subscriptionData)
      setOpenDeleteDialog(true)
    }else{
      setOpenDeleteDialog(false)
    }
  }

  const preDeleteSubscription = (subscriptionData) => {
    setLoading(true)
    client.mutate({
      mutation: PRE_CANCEL_SUBSCRIPTION,
      variables: {
        id: subscriptionData.subscription.id
      },
      refetchQueries: [{
        query: GET_SUBSCRIPTIONS
      }]
    })
    .then(result => {
      if(result.data.preCancelSubscription) {
        showSnackMessage('L\'abonnement a bien été annulé', 'success')
      }else{
        showSnackMessage('Une erreur s\'est produite durant l\'annulation', 'error')
      }
      setLoading(false)
    })
    .catch(error => {
      console.log(error)
      showSnackMessage('Une erreur s\'est produite durant l\'annulation', 'error')
      setLoading(false)
    })
  }

  const deleteSubscription = () => {
    setLoading(true)
    console.log('DELETE SUBSCRIPTION')
    if(refundType === 'discount') {
      client.mutate({
        mutation: CANCEL_SUBSCRIPTION_DISCOUNT,
        variables: {
          id: selectedSubscriptionData.subscription.id
        },
        refetchQueries: [{
          query: GET_SUBSCRIPTIONS
        }]
      })
      .then(result => {
        if(result.data.cancelSubscriptionWithDiscount) {
          showSnackMessage('L\'abonnement a bien été annulé', 'success')
        }else{
          showSnackMessage('Une erreur s\'est produite durant l\'annulation', 'error')
        }
        setLoading(false)
        setOpenDeleteDialog(false)
      })
      .catch(error => {
        console.log(error)
        showSnackMessage('Une erreur s\'est produite durant l\'annulation', 'error')
        setLoading(false)
        setOpenDeleteDialog(false)
      })
    }else{
      console.log('PAYMENT')
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
      },
      refetchQueries: [{
        query: GET_SUBSCRIPTIONS
      }]
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

  return(
    <React.Fragment>
      <Container component="main" maxWidth="xl" className={classes.root}>
        <CssBaseline />
        <MaterialTable
          title="Liste des abonnnements"
          columns={columns}
          data={rows}
          actions={[
            {
              icon: () => <Edit />,
              tooltip: 'Modifier l\'abonnement',
              onClick: (event, rowData) => handleEditDialog(rowData)
            },
            rowData => ({
              icon: () => <Delete />,
              tooltip: 'Annuler l\'abonnement',
              onClick: (event, rowData) =>  rowData.subscription.subStatus === 'WAITING_PAYEMENT' ? preDeleteSubscription(rowData) : handleDeleteDialog(rowData),
              disabled: rowData.subscription.subStatus !== 'WAITING_PAYEMENT' && rowData.subscription.subStatus !== 'WAITING_BEGIN' && rowData.subscription.subStatus !== 'ON_GOING'
            }),
            {
              icon: () => <Info />,
              tooltip: 'Informations',
              onClick: (event, rowData) => handleInfosDialog(rowData)
            }
          ]}
        />
      </Container>
      <Dialog open={openInfosDialog} fullWidth={true} maxWidth='sm'>
        <DialogTitle>Informations sur les cours</DialogTitle>
        <DialogContent>
          <Container component="main" maxWidth="xl" className={classes.container}>
            {selectedSubscriptionData.subscription.lessons.map(lesson => (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleInfosDialog(null)} color="default" disabled={loading}>
            Retour           
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} fullWidth={true} maxWidth='sm'>
        <DialogTitle>Annuler l'abonnement de {selectedSubscriptionData.subscription.user.firstName} {selectedSubscriptionData.subscription.user.lastName}</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Méthode de remboursement</FormLabel>
            <RadioGroup aria-label="gender" name="gender1" value={refundType} onChange={ event => {setRefundType(event.target.value)}}>
              <FormControlLabel value="discount" control={<Radio />} label="Générer un bon d'achat" />
              <FormControlLabel value="refund" disabled control={<Radio />} label="Générer un paiement direct" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDeleteDialog(null)} color="default" disabled={loading}>
            Annuler           
          </Button>
          <Button onClick={() => deleteSubscription()} color="primary" disabled={loading}>
            Confirmer        
          </Button> 
        </DialogActions>
      </Dialog>
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
    </React.Fragment>
  )

  /*
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
                    <TableCell>{subscriptionData.mollieSubscription ? subscriptionData.mollieSubscription.status : 'Non payé' }</TableCell>
                    <TableCell>
                      <Tooltip title="Modifier l'abonnement">
                        <IconButton onClick={() => handleEditDialog(subscriptionData)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {(subscriptionData.subscription.subStatus === 'WAITING_BEGIN' || subscriptionData.subscription.subStatus === 'ON_GOING' ) && 
                        <Tooltip title="Annuler l'abonnement">
                          <IconButton onClick={() => handleDeleteDialog(subscriptionData)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      }
                      {(subscriptionData.subscription.subStatus === 'WAITING_PAYEMENT') && 
                        <Tooltip title="Annuler l'abonnement">
                          <IconButton onClick={() => preDeleteSubscription(subscriptionData)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      }
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
      <Dialog open={openDeleteDialog} fullWidth={true} maxWidth='sm'>
        <DialogTitle>Annuler l'abonnement de {selectedSubscriptionData.subscription.user.firstName} {selectedSubscriptionData.subscription.user.lastName}</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Méthode de remboursement</FormLabel>
            <RadioGroup aria-label="gender" name="gender1" value={refundType} onChange={ event => {setRefundType(event.target.value)}}>
              <FormControlLabel value="discount" control={<Radio />} label="Générer un bon d'achat" />
              <FormControlLabel value="refund" disabled control={<Radio />} label="Générer un paiement direct" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDeleteDialog(null)} color="default" disabled={loading}>
            Annuler           
          </Button>
          <Button onClick={() => deleteSubscription()} color="primary" disabled={loading}>
            Confirmer        
          </Button> 
        </DialogActions>
      </Dialog>
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
  */
}

