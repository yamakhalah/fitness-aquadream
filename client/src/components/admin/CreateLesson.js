import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { CircularProgress, FormControlLabel, Switch, OutlinedInput, InputAdornment, FormControl, Container, CssBaseline, Typography, Grid, MenuItem, Select, Button, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { GET_NO_SHOW_DATE } from '../../database/query/noShowDateQuery'
import { GET_LESSON_TYPES } from '../../database/query/lessonTypeQuery'
import { GET_LESSON_SUB_TYPES } from '../../database/query/lessonSubTypeQuery'
import { GET_TEACHERS } from '../../database/query/teacherQuery'
import { CREATE_LESSON_AND_LESSONS_DAY } from '../../database/mutation/lessonMutation'
import DateFnsUtils from '@date-io/date-fns'
import frLocale from "date-fns/locale/fr";
import moment from 'moment'
import localization from 'moment/locale/fr'

moment.locale('fr', localization)
//moment.tz.setDefault('Europe/Brussels')


const styles = theme => ({
  paper: {
    marginTop: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  formControl: {
    minWidth: '100%',
  },
  img: {
    width: '70%',
    margin: 0,
    padding: 0
  },
  title: {
    float: 'left',
    marginTop: 20,
    marginBottom: 10
  },
  marginTop: {
    marginTop: 15
  },
  buttonProgress: {
    color: 'green',
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
})

class CreateLesson extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState([], [], [], [])
  }

  getInitialState(teachers, noShowDates, lessonTypes, lessonSubTypes) {
    return  {
      teachers: teachers, 
      noShowDates: noShowDates,
      lessonTypes: lessonTypes,
      lessonSubTypes: lessonSubTypes,
      name: '',
      info: '',
      mainType: 'COLLECTIF',
      dateType: '',
      lessonType: '',
      lessonSubType: '',
      street: 'Rue St Fargeau Ponthierry 15',
      city: 'Temploux',
      postalCode: '5020',
      recurenceBegin: moment().set({
        'hour': 0,
        'minute': 0
      }),
      recurenceEnd: moment().set({
        'hour': 0,
        'minute': 0
      }),
      timeBegin: moment(),
      timeEnd: moment(),
      priorityDate: moment(),
      classicDate: moment(),
      unitPrice: 0,
      unitPrice2X: 0,
      unitPrice3X: 0,
      monthlyPrice: 0,
      monthlyPrice2X: 0,
      monthlyPrice3X: 0,
      totalPrice: 0,
      totalPrice2X: 0,
      totalPrice3x: 0,
      teacher: '',
      totalLessons: 0,
      totalMonth: 0,
      isOpened: false,
      isHidden: false,
      isUnitPurchasable: false,
      spotTotal: 0,
      open: false,
      openSnack: false,
      selectedDayDate: moment().day(),
      loading: false,
      success: false,
      errorVariant: 'error',
      errorMessage: ''  
    }
  }

  componentDidMount() {
    var noShowDates = []
    var lessonTypes = []
    var lessonSubTypes = []

    this.props.client.query({
      query: GET_LESSON_TYPES,
      fetchPolicy: 'network-only'
    }).then(result => {
      result.data.lessonsType.forEach(element => {
        lessonTypes.push(element)
      })
      this.setState({ lessonTypes: lessonTypes })
    })

    this.props.client.query({
      query: GET_LESSON_SUB_TYPES,
      fetchPolicy: 'network-only'
    }).then(result => {
      result.data.lessonsSubType.forEach(element => {
        lessonSubTypes.push(element)
      })
      this.setState({ lessonSubTypes: lessonSubTypes })
    })

    this.props.client.query({
      query: GET_NO_SHOW_DATE,
      fetchPolicy: 'network-only'
    }).then(result => {
      result.data.noShowDates.forEach(element => {
        noShowDates.push(element)
      })
      this.setState({ noShowDates: noShowDates })
    })

    this.props.client.query({
      query: GET_TEACHERS,
      fetchPolicy: 'network-only'
    }).then(result => {
      this.setState({ teachers: result.data.teachers })
    })
  }

  disableDayDate(date) {
    return moment(date).day() !== this.state.selectedDayDate
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSwitchChange(event) {
    this.setState({
      [event.target.name]: event.target.checked
    })
  }

  handlePriceChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    })
    var totalPrice = event.target.value * this.state.totalLessons
    var montlyPrice = Math.ceil(totalPrice / this.state.totalMonth)
    switch(event.target.name) {
      case 'unitPrice':
        this.setState({ 
          totalPrice: totalPrice,
          monthlyPrice: montlyPrice
        })
        break
      case 'unitPrice2X':
        this.setState({ 
          totalPrice2X: totalPrice,
          monthlyPrice2X: montlyPrice 
        })
        break
      case 'unitPrice3X':
        this.setState({ 
          totalPrice3X: totalPrice,
          monthlyPrice3X: montlyPrice 
        })
        break
      default:
        console.log('NOT REVELANT DEFAULT')
        break
    }
  }

  handleDateChange = (event, id) => {
    var date = moment(event)
    switch(id) {
      case 'recurenceBegin':
        this.setState({
          [id]: moment(event, 'DD/MM/YYYY').hour(this.state.timeBegin.hour()).minute(this.state.timeBegin.minute())
        })
        this.refreshTotalLessons(event, undefined)
        this.refreshTotalMonth(event, undefined)
        this.setState({ selectedDayDate: event.getDay()})
        break
      case 'recurenceEnd':
        this.setState({
          [id]: moment(event, 'DD/MM/YYYY').hour(this.state.timeEnd.hour()).minute(this.state.timeEnd.minute())
        })
        this.refreshTotalLessons(undefined, event)
        this.refreshTotalMonth(undefined, event)
        break
      case 'timeBegin':
        this.setState({
          [id]: moment(date, 'DD/MM/YYYY'),
          'recurenceBegin': this.state.recurenceBegin.hour(date.hour()).minute(date.minute()),
        })
        this.refreshTotalLessons(undefined, undefined)
        break
      case 'timeEnd':
        this.setState({
          [id]: moment(date, 'DD/MM/YYYY'),
          'recurenceEnd': this.state.recurenceEnd.hour(date.hour()).minute(date.minute()),
        })
        this.refreshTotalLessons(undefined, undefined)
      break
      default:
        this.setState({
          [id]: moment(event, 'DD/MM/YYYY')
        })
        break
    }
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleSnackClose = () => {
    this.setState({ openSnack: false })
  }

  handleButtonConfirm = () => {
    if(!this.state.loading) {
      this.setState({
        success: false,
        loading: true,
      })
      this.createLesson()
    }
  }

  showSnackMessage = (message, type) => {
    this.setState({
      errorMessage: message,
      errorVariant: type,
      openSnack: true
    })
  }

  refreshPrice = (totalLessons) => {
    var totalPrice = Math.ceil(this.state.unitPrice * totalLessons)
    var totalPrice2X = Math.ceil(this.state.unitPrice2X * totalLessons)
    var totalPrice3X = Math.ceil(this.state.unitPrice3X * totalLessons)
    var monthlyPrice = Math.ceil(totalPrice / this.state.totalMonth) || 0
    var monthlyPrice2X = Math.ceil(totalPrice2X / this.state.totalMonth) || 0
    var monthlyPrice3X = Math.ceil(totalPrice3X / this.state.totalMonth) || 0

    this.setState({
      totalPrice: totalPrice,
      totalPrice2X: totalPrice2X,
      totalPrice3X: totalPrice3X,
      monthlyPrice: monthlyPrice,
      monthlyPrice2X: monthlyPrice2X,
      monthlyPrice3X: monthlyPrice3X
    })
  }

  refreshTotalMonth = (recurenceBegin, recurenceEnd) => {
    var indexDate = recurenceBegin ? moment(recurenceBegin) : this.state.recurenceBegin.clone()
    var endDate = recurenceEnd ? moment(recurenceEnd) : this.state.recurenceEnd.clone()
    var indexMonth = Number(indexDate.format("MM")) + (Number(indexDate.format("YYYY")) *12)
    var endMonth = Number(endDate.format("MM")) + (Number(endDate.format("YYYY")) *12)
    var diff = (endMonth - indexMonth)+1
    this.setState({
      totalMonth: diff
    })
  }

  refreshTotalLessons = (recurenceBegin, recurenceEnd) => {
    var indexDate = recurenceBegin ? moment(recurenceBegin) : this.state.recurenceBegin.clone()
    var endDate = recurenceEnd ? moment(recurenceEnd) : this.state.recurenceEnd.clone()
    var counter = 0
    while(indexDate.isSameOrBefore(endDate)) {
      var dateValid = true
      this.state.noShowDates.forEach(element => {
        var beginInterval = moment(element.begin, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
        var endInterval = moment(element.end, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
        if(indexDate.isSameOrAfter(beginInterval) && indexDate.isSameOrBefore(endInterval)) {
          dateValid = false
        }
      })
      if(dateValid) {
        counter++
      }
      indexDate.add(7, 'd')
    }
    this.setState({ totalLessons: counter })
    this.refreshPrice(counter)
  }

  createLesson = () => {
    var lesson = {
      lessonsDay: [],
      teacher: this.state.teacher,
      discount: this.state.lessonType.toUpperCase()+'-'+this.state.lessonSubType.toUpperCase()+'-'+this.state.city.toUpperCase()+'-'+this.state.recurenceBegin.day()+'-'+this.state.timeBegin.hour()+'-'+this.state.recurenceBegin.year(),
      address: {
        street: this.state.street,
        city: this.state.city,
        postalCode: this.state.postalCode
      },
      pricing: {
        unitPrice: Number(this.state.unitPrice),
        unitPrice2X: Number(this.state.unitPrice2X),
        unitPrice3X: Number(this.state.unitPrice3X),
        monthlyPrice: Number(this.state.monthlyPrice),
        monthlyPrice2X: Number(this.state.monthlyPrice2X),
        monthlyPrice3X: Number(this.state.monthlyPrice3X),
        totalPrice: Number(this.state.totalPrice),
        totalPrice2X: Number(this.state.totalPrice2X),
        totalPrice3X: Number(this.state.totalPrice3X)
      },

      totalMonth: Number(this.state.totalMonth),
      totalLessons: Number(this.state.totalLessons),
      classicDate: this.state.classicDate.toISOString(true),
      priorityDate: this.state.priorityDate.toISOString(true),
      recurenceBegin: this.state.recurenceBegin.toISOString(true),
      recurenceEnd: this.state.recurenceEnd.toISOString(true),
      spotLeft: Number(this.state.spotTotal),
      spotTotal: Number(this.state.spotTotal),
      lessonType: this.state.lessonType,
      lessonSubType: this.state.lessonSubType,
      mainType: this.state.mainType,
      dateType: this.state.dateType,
      name: this.state.name,
      comment: this.state.info,
      isOpened: this.state.isOpened,
      isHidden: !this.state.isHidden
    }

    const lessonsDay = this.createLessonsDay()
    this.props.client.mutate({
      mutation: CREATE_LESSON_AND_LESSONS_DAY,
      variables: {
        lesson: lesson,
        lessonsDay: lessonsDay
      },
    })
    .then(result => {
      if(result.data.createLessonAndLessonsDay){
        const teachers = this.state.teachers
        const noShowDates = this.state.noShowDates
        const lessonTypes = this.state.lessonTypes
        const lessonSubTypes = this.state.lessonSubTypes
        this.setState(this.getInitialState(teachers, noShowDates, lessonTypes, lessonSubTypes))
        this.showSnackMessage('Le cours a bien été crée', 'success')
      }else{
        this.showSnackMessage('Une erreur est survenue durant l\'enregistrement', 'error')
      }
    })
    .catch(error => {
      console.log(error)
      this.showSnackMessage('Une erreur est survenue durant l\'enregistrement', 'error')
    })
  }

  createLessonsDay = () => {
    var counter = 0
    var lessonsDay = []
    var indexDate = moment(this.state.recurenceBegin.toISOString())
    var endDate = moment(this.state.recurenceEnd.toISOString())
    while(indexDate.isSameOrBefore(endDate)) {
      var dateValid = true
      this.state.noShowDates.forEach(element => {
        var beginInterval = moment(element.begin, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
        var endInterval = moment(element.end, 'YYYY-MM-DDTHH:mm:ss.SSSSZ')
        if(indexDate.isSameOrAfter(beginInterval) && indexDate.isSameOrBefore(endInterval)) {
          dateValid = false
        }
      })
      if(dateValid) {
        var lessonDay = {
          teacher: this.state.teacher,
          dayDate: indexDate.toISOString(true),
          hour: {
            begin: this.state.timeBegin.format('HH:mm'),
            end: this.state.timeEnd.format('HH:mm')
          },
          spotLeft: Number(this.state.spotTotal),
          spotTotal: Number(this.state.spotTotal)
        }
        lessonsDay.push(lessonDay)
        counter++
        if(counter === this.state.totalLessons) {
          return lessonsDay
        }
      }
      indexDate.add(7, 'd')
    }
    return lessonsDay
  }

  confirmForm = () => {
    this.setState({ open: true })
  }


  render() {
    const { classes } = this.props
    return(
      <div>
      {this.state.loading && <CircularProgress size={150} className={classes.buttonProgress} />} 
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h4">
            Création de cours
          </Typography>
          <ValidatorForm className={classes.form} noValidate onSubmit={this.confirmForm.bind(this)} disabled={this.state.loading}>
            <Typography className={classes.title} component="h6" variant="h6">
              Infos cours
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextValidator
                  name="name"
                  variant="outlined"
                  required
                  fullWidth
                  id="name"
                  label="Nom du cours"
                  autoFocus
                  value={this.state.name}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextValidator
                  name="info"
                  variant="outlined"
                  required
                  fullWidth
                  id="info"
                  label="Info client"
                  value={this.state.info}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl  required variant="outlined" className={classes.formControl}>
                <InputLabel id="dateType">Type de date</InputLabel>
                <Select
                  labelId="dateType"
                  id="dateType"
                  value={this.state.dateType}
                  name="dateType"
                  label="Type de date"
                  labelWidth={95}
                  onChange={event => this.handleChange(event)}
                >
                  <MenuItem value="" disabled>
                    Type de date
                  </MenuItem>
                  <MenuItem value={'S1'}>Premier Semestre</MenuItem>
                  <MenuItem value={'S2'}>Second Semestre</MenuItem>
                  <MenuItem value={'HOLLIDAY'}>Vacances</MenuItem>
                </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
              <FormControl required variant="outlined" className={classes.formControl}>
                <InputLabel id="lessonType">Type de cours</InputLabel>
                <Select
                  labelId="lessonType"
                  id="lessonType"
                  value={this.state.lessonType}
                  name="lessonType"
                  label="Type de cours"
                  labelWidth={100}
                  onChange={event => this.handleChange(event)}
                >
                  <MenuItem value="" disabled>
                    Type de cours
                  </MenuItem>
                  {this.state.lessonTypes.map(type => 
                    <MenuItem key={type.id} value={type.id}>{type.simpleName}</MenuItem>
                  )}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
              <FormControl required variant="outlined" className={classes.formControl}>
                <InputLabel id="lessonSubType">Sous Type</InputLabel>
                <Select
                  labelId="lessonSubType"
                  id="lessonSubType"
                  value={this.state.lessonSubType}
                  name="lessonSubType"
                  label="Sous Type"
                  labelWidth={75}
                  onChange={event => this.handleChange(event)}
                >
                  <MenuItem value="" disabled>
                    Sous Type
                  </MenuItem>
                  {this.state.lessonSubTypes.map(subType => 
                    <MenuItem key={subType.id} value={subType.id}>{subType.simpleName}</MenuItem>
                  )}
                </Select>
                </FormControl>
              </Grid>
            </Grid>
              <Typography className={classes.title} component="h6" variant="h6">
                Adresse
              </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextValidator
                  disabled
                  name="street"
                  variant="outlined"
                  required
                  fullWidth
                  id="street"
                  label="Rue"
                  value={this.state.street}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextValidator
                  disabled
                  name="city"
                  variant="outlined"
                  required
                  fullWidth
                  id="city"
                  label="Ville"
                  value={this.state.city}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextValidator
                  disabled
                  name="postalCode"
                  variant="outlined"
                  required
                  fullWidth
                  id="postalCode"
                  label="Code postal"
                  value={this.state.postalCode}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
            </Grid>
            <Typography className={classes.title} component="h6" variant="h6">
               Dates et heures
            </Typography>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <KeyboardDatePicker
                  required
                  name="recurenceBegin"
                  margin="normal"
                  id="recurenceBegin"
                  label="Date de début"
                  format="dd/MM/yyyy"
                  minDate={moment()}
                  value={this.state.recurenceBegin}
                  onChange={event => this.handleDateChange(event, 'recurenceBegin')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner date'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KeyboardDatePicker
                  required
                  name="recurenceEnd"
                  margin="normal"
                  id="recurenceEnd"
                  label="Date de fin"
                  format="dd/MM/yyyy"
                  minDate={moment()}
                  shouldDisableDate={this.disableDayDate.bind(this)}
                  value={this.state.recurenceEnd}
                  onChange={event => this.handleDateChange(event, 'recurenceEnd')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner date'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                  <KeyboardTimePicker
                    required
                    name="timeBegin"
                    margin="normal"
                    id="timeBegin"
                    label="Heure de début"
                    ampm={false}
                    value={this.state.timeBegin}
                    onChange={event => this.handleDateChange(event, 'timeBegin')}
                    KeyboardButtonProps={{
                      'aria-label': 'Sélectionner Heure'
                    }}
                  />
              </Grid>
              <Grid item xs={12} md={3}>
                  <KeyboardTimePicker
                    required
                    name="timeEnd"
                    margin="normal"
                    id="timeEnd"
                    label="Heure de fin"
                    ampm={false}
                    value={this.state.timeEnd}
                    onChange={event => this.handleDateChange(event, 'timeEnd')}
                    KeyboardButtonProps={{
                      'aria-label': 'Sélectionner Heure'
                    }}
                  />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <KeyboardDatePicker
                  required
                  name="priorityDate"
                  margin="normal"
                  id="priorityDate"
                  label="Inscription prioritaire"
                  format="dd/MM/yyyy"
                  minDate={moment()}
                  value={this.state.priorityDate}
                  onChange={event => this.handleDateChange(event, 'priorityDate')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner date'
                  }}
                />
              </Grid>             
              <Grid item xs={12} md={3}>
                <KeyboardDatePicker
                  required
                  name="classicDate"
                  margin="normal"
                  id="classicDate"
                  label="Inscription normale"
                  format="dd/MM/yyyy"
                  minDate={moment()}
                  value={this.state.classicDate}
                  onChange={event => this.handleDateChange(event, 'classicDate')}
                  KeyboardButtonProps={{
                    'aria-label': 'Sélectionner date'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextValidator
                  name="totaMonth"
                  variant="outlined"
                  required
                  fullWidth
                  id="totalMonth"
                  label="Nombre de mois"
                  value={this.state.totalMonth}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextValidator
                  name="totaLessons"
                  variant="outlined"
                  required
                  fullWidth
                  id="totalLessons"
                  label="Nombre de cours"
                  helperText="Hors congés encodés"
                  value={this.state.totalLessons}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                  disabled
                />
              </Grid>
            </Grid>
            </MuiPickersUtilsProvider>
            <Typography className={classes.title} component="h6" variant="h6">
               Prix et places
            </Typography>
          <Grid container spacing={2} className={classes.marginTop}>          
            <Grid item xs={12} md={3}>
              <FormControl required variant="outlined">
                <InputLabel>Prix unitaire</InputLabel>
                <OutlinedInput
                  name="unitPrice"
                  variant="outlined"
                  required
                  fullWidth
                  id="unitPrice"
                  label="Prix unitaire"
                  labelWidth={100}
                  value={this.state.unitPrice}
                  onChange={event => this.handlePriceChange(event)}
                  startAdornment={<InputAdornment position="start">€</InputAdornment>}
                />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
              <FormControl required variant="outlined">
                <InputLabel>Prix unitaire dégressif 2X</InputLabel>
                <OutlinedInput
                  name="unitPrice2X"
                  variant="outlined"
                  required
                  fullWidth
                  id="unitPrice2X"
                  label="Prix unitaire dégressif 2X"
                  labelWidth={195}
                  value={this.state.unitPrice2X}
                  onChange={event => this.handlePriceChange(event)}
                  startAdornment={<InputAdornment position="start">€</InputAdornment>}
                />
              </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
              <FormControl required variant="outlined">
                <InputLabel>Prix unitaire dégressif 3X</InputLabel>
                <OutlinedInput
                  name="unitPrice3X"
                  variant="outlined"
                  required
                  fullWidth
                  id="unitPrice3X"
                  label="Prix unitaire dégressif 3X"
                  labelWidth={195}
                  value={this.state.unitPrice3X}
                  onChange={event => this.handlePriceChange(event)}
                  startAdornment={<InputAdornment position="start">€</InputAdornment>}
                />
              </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextValidator
                  name="spotTotal"
                  variant="outlined"
                  required
                  fullWidth
                  id="spotTotal"
                  label="Nombre de place"
                  value={this.state.spotTotal}
                  validators={['required']}
                  errorMessages={['Champ requis']}
                  onChange={event => this.handleChange(event)}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.marginTop}>          
              <Grid item xs={12} md={3}>
                <FormControl  required variant="outlined">
                  <InputLabel>Prix Total</InputLabel>
                  <OutlinedInput
                    name="Prix total"
                    variant="outlined"
                    required
                    fullWidth
                    id="totalPrice"
                    label="Prix total"
                    labelWidth={80}
                    disabled
                    value={this.state.totalPrice}
                    onChange={event => this.handleChange(event)}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl required variant="outlined">
                  <InputLabel>Prix total dégressif 2X</InputLabel>
                  <OutlinedInput
                    name="totalPriceDeg"
                    variant="outlined"
                    required
                    fullWidth
                    id="totalPrice2X"
                    label="Prix total dégressif 2X"
                    labelWidth={170}
                    value={this.state.totalPrice2X}
                    disabled
                    onChange={event => this.handleChange(event)}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl required variant="outlined">
                  <InputLabel>Prix total dégressif 3X</InputLabel>
                  <OutlinedInput
                    name="totalPrice3X"
                    variant="outlined"
                    required
                    fullWidth
                    id="totalPrice3X"
                    label="Prix total dégressif 3X"
                    labelWidth={170}
                    value={this.state.totalPrice3X}
                    disabled
                    onChange={event => this.handleChange(event)}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
              <FormControlLabel
                  required
                  control={
                  <Switch 
                    name="isOpened"
                    id="isOpened"
                    value="false"
                    checked={this.state.isOpened}
                    onChange={event => this.handleSwitchChange(event)}
                    color="primary"
                  />
                  }
                  label="Ouvrir le cours"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.marginTop}>          
              <Grid item xs={12} md={3}>
                <FormControl  required variant="outlined">
                  <InputLabel>Prix Mensuel</InputLabel>
                  <OutlinedInput
                    name="monthlyPrice"
                    variant="outlined"
                    required
                    fullWidth
                    id="monthlyPrice"
                    label="Prix mensuel"
                    labelWidth={105}
                    disabled
                    value={this.state.monthlyPrice}
                    onChange={event => this.handleChange(event)}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl required variant="outlined">
                  <InputLabel>Prix mensuel dégressif 2X</InputLabel>
                  <OutlinedInput
                    name="monthlyPrice2X"
                    variant="outlined"
                    required
                    fullWidth
                    id="monthlyPrice2X"
                    label="Prix mensuel dégressif 2X"
                    labelWidth={200}
                    value={this.state.monthlyPrice2X}
                    disabled
                    onChange={event => this.handleChange(event)}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl required variant="outlined">
                  <InputLabel>Prix mensuel dégressif 3X</InputLabel>
                  <OutlinedInput
                    name="monthlyPrice3X"
                    variant="outlined"
                    required
                    fullWidth
                    id="monthlyPrice3X"
                    label="Prix mensuel dégressif 3X"
                    labelWidth={200}
                    value={this.state.monthlyPrice3X}
                    disabled
                    onChange={event => this.handleChange(event)}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
              <FormControlLabel
                  required
                  control={
                  <Switch 
                    name="isHidden"
                    id="isHidden"
                    value="false"
                    checked={this.state.isHidden}
                    onChange={event => this.handleSwitchChange(event)}
                    color="primary"
                  />
                  }
                  label="Visibilité du cours"
                />
              </Grid>
            </Grid>
            <Typography className={classes.title} component="h6" variant="h6">
              Professeur
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl required variant="outlined" className={classes.formControl}>
                  <InputLabel id="lessonType">Professeur</InputLabel>
                  <Select
                    labelId="teacher"
                    id="teacher"
                    value={this.state.teacher}
                    name="teacher"
                    label="Professeur"
                    labelWidth={80}
                    onChange={event => this.handleChange(event)}
                  >
                    <MenuItem disabled>
                      Professeur
                    </MenuItem>
                    {this.state.teachers.map(teacher =>               
                      <MenuItem key={teacher.id} value={teacher.id}>{teacher.user.firstName} {teacher.user.lastName}</MenuItem>
                    )}
                  </Select>
                </FormControl>
                </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Créer le cours
            </Button>
          </ValidatorForm>
        </div>
      </Container>
      <Dialog
        open={this.state.open}
      >
        <DialogTitle>{"Confirmer la création du cours ?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vous vous appretez à créer un ensemble de cours. Vérifiez bien les informations que vous avez entré avant de valider ce formulaire. En cas d'erreur vous pouvez supprimer ce cours via l'onglet 'Cours'
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose.bind(this)} color="default" disabled={this.state.loading}>
            Annuler           
          </Button>
          <Button onClick={this.handleButtonConfirm.bind(this)} color="primary" disabled={this.state.loading}>
            Confirmer           
          </Button>          
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={this.state.openSnack}
        autoHideDuration={8000}
        onClose={this.handleSnackClose}
      >
      <CustomSnackBar
        onClose={this.handleSnackClose}
        variant={this.state.errorVariant}
        message={this.state.errorMessage}
      />
      </Snackbar>
      </div>
    )
  }
}

export default withApollo(withRouter(withStyles(styles)(CreateLesson)))

