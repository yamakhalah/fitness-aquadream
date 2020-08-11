import React, { useEffect } from 'react'
import moment from 'moment-timezone'
import { Snackbar, List, ListItem, ListItemText, Typography, Container, TextField, Button} from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { GET_DISCOUNT_BY_CODE } from '../../../database/query/discountQuery'
import { CustomSnackBar } from '../../global/CustomSnackBar'
import { useApolloClient, useQuery } from 'react-apollo'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: 'theme.palette.background.paper',
    padding: theme.spacing(3),
  },
  discount: {
   paddingTop: 35,
   display: 'flex',
   justifyContent: 'space-between'
  },
  listItem: {
    padding: theme.spacing(1,0)
  },
  total: {
    fontWeight: '700'
  },
  title: {
    marginTop: theme.spacing(2)
  },
  subTitle: {
    textAlign: 'left',
    paddingBottom: 25,
    paddingTop: 25
  },
  reducTitle: {
    textAlign: 'left'
  },
  reducAmount: {
    paddingRight: 10
  },
  loader: {
    textAlign: 'center'
  },
}))

const OrderResume = ({ handleFinalPriceCallBack, preBookedLessons, bookedLessons, fUser, adminMode}) => {
  const classes = useStyles()
  const [user, setUser] = React.useState(fUser())
  const [client, setClient] = React.useState(useApolloClient())
  const [needReRender, setNeedReRender] = React.useState(false)
  const [totalPayement, setTotalPayement] = React.useState(0)
  const [monthlyPayement, setMonthlyPayement] = React.useState([0,0,0,0,0,0,0,0,0,0,0,0])
  const [adminDiscountAmount, setAdminDiscountAmount] = React.useState(0)
  const [discountAmount, setDiscountAmount] = React.useState(0)
  const [discountCode, setDiscountCode] = React.useState('')
  const [discounts, setDiscounts] = React.useState([])
  const [openSnack, setOpenSnack] = React.useState(false)
  const [errorVariant, setErrorVariant] = React.useState('error')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [admin,] = React.useState(adminMode)
  const [bookedLessonsDiscount, setBookedLessonsDiscount] = React.useState({
    "X1": [],
    "X2": [],
    "X3": []
  })
  const [orderResume, setOrderResume] = React.useState({
    subDuration: 0,
    total: 0,
    totalMonthly: 0,
    yearlyTax: 0,
    lessonsData: []
  })

  useEffect(() => {
    console.log('USE EFFECT')
    if(bookedLessons.length > 0) {
      var lessonsData = []
      var highestMonth = 0
      var total = 0
      var totalMonth = 0
      var closestRecurenceBegin = moment(bookedLessons[0].recurenceBegin)
      var closestRecurenceEnd = moment(bookedLessons[0].recurenceEnd)
      var lBookedLessonsDiscount = {
        "X1": [],
        "X2": [],
        "X3": []
      }
      bookedLessons.forEach(lesson => {
        var counter = 1
        if(lesson.totalMonth > highestMonth) {
          highestMonth = lesson.totalMonth
        }
        var recurenceBegin = moment(lesson.recurenceBegin)
        var recurenceEnd = moment(lesson.recurenceEnd)
        if(recurenceBegin.isSameOrBefore(closestRecurenceBegin)) {
          closestRecurenceBegin = recurenceBegin
        }
        if(recurenceEnd.isSameOrAfter(closestRecurenceEnd)) {
          closestRecurenceEnd = recurenceEnd
        }
        lesson.lessonType.compatibilities.forEach(compatibility => {
          bookedLessons.forEach(lessonBis => {
            if(lesson.id !== lessonBis.id) {
              lessonBis.lessonType.compatibilities.forEach(compatibilityBis => {
                if(compatibility.id === compatibilityBis.id) {
                  counter++
                }
              })
            }
          })
        })
      
        if(counter >= 3) {
          lBookedLessonsDiscount['X3'].push(lesson)
          total += lesson.pricing.totalPrice3X
        }else if(counter == 2) {
          lBookedLessonsDiscount['X2'].push(lesson)
          total += lesson.pricing.totalPrice2X 
        }else {
          lBookedLessonsDiscount['X1'].push(lesson)
          total += lesson.pricing.totalPrice
        }
      });
      totalMonth = Math.ceil(total/highestMonth)
      lBookedLessonsDiscount['X1'].forEach(lesson => {
        var data = {
          lesson: lesson,
          lessonMonthlyPrice: Math.ceil((lesson.pricing.totalPrice/highestMonth))
        }
        lessonsData.push(data)
      })
      lBookedLessonsDiscount['X2'].forEach(lesson => {
        var data = {
          lesson: lesson,
          lessonMonthlyPrice: Math.ceil((lesson.pricing.totalPrice2X/highestMonth))
        }
        lessonsData.push(data)
      })
      lBookedLessonsDiscount['X3'].forEach(lesson => {
        var data = {
          lesson: lesson,
          lessonMonthlyPrice: Math.ceil((lesson.pricing.totalPrice3X/highestMonth))
        }
        lessonsData.push(data)
      })
      var tax = 0
      if(!user.paidYearlyTax && !adminMode) {
        tax = 35
      }
      var orderResume = {
        recurenceBegin: closestRecurenceBegin.toISOString(true),
        recurenceEnd: closestRecurenceEnd.toISOString(true),
        subDuration: highestMonth,
        total: Math.ceil((total - discountAmount)),
        totalMonthly: Math.ceil(((total-discountAmount)/highestMonth)),
        yearlyTax: tax,
        lessonsData: lessonsData,
        discounts: discounts
      }
      setBookedLessonsDiscount(lBookedLessonsDiscount)
      setOrderResume(orderResume)
      handleFinalPriceCallBack(orderResume)
    }
  }, [discountAmount], [discounts])

  const changeDiscountCode = (event) => {
    setDiscountCode(event.target.value)
  }

  const changeAdminDiscountAmount = (event) => {
    setAdminDiscountAmount(event.target.value)
  }

  const validateAdminDiscount = () => {
    setDiscountAmount(adminDiscountAmount)
  }

  const validateDiscountCode = () => {
    var list = discounts
    for(const element of list) {
      if(element.discount === discountCode) {
        showSnackMessage('Ce code est déjà enregistré', 'error')
        setDiscountCode('')
        return
      }
    }
    client.query({
      query: GET_DISCOUNT_BY_CODE,
      fetchPolicy: 'network-only',
      variables: {
        code: discountCode,
        user: user.id
      }
    })
    .then(result => {
      var discount = result.data.discountByCode
      if(discount === null) {
        showSnackMessage('Ce code n\'existe pas', 'error')
        setDiscountCode('')
      }else if(discount.value > orderResume.total){
        showSnackMessage('La valeur de ce bon d\'achat est supérieur au montant total', 'error')
        setDiscountCode('')
      }else if(discount.status === 'USED'){
        showSnackMessage('Ce code a déjà été utilisé', 'error')
        setDiscountCode('')
      }else{
        var amount = discountAmount
        console.log(result)
        list.push(result.data.discountByCode)
        setDiscountAmount(amount+discount.value)
        setDiscounts([...list])
        setDiscountCode('')
      }
    })
    .catch(error => {
      console.log(error)
      showSnackMessage('Une erreur est survenue pendant la vérification', 'error')
      setDiscountCode('')
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

  return(
    <div>
    <Container component="main" maxWidth="sm" className={classes.root}>
      <Typography variant="h4">
        Récapitulatif
      </Typography>
      {preBookedLessons.length > 0 && (
        <Typography className={classes.subTitle} variant="h5">
          Pré-inscriptions
        </Typography>
      )}
      <List disablePadding>
        {preBookedLessons.map(lesson => (
          <ListItem className={classes.listItem} key={lesson.id}>
            <ListItemText primary={lesson.name} secondary={'Du '+moment(lesson.recurenceBegin).format('DD/MM/YYYY')+' au '+moment(lesson.recurenceEnd).format('DD/MM/YYYY')} />
            <Typography variant="body2">Gratuit</Typography>
          </ListItem>
        ))}
      </List>
      {bookedLessons.length > 0 && (
        <Typography className={classes.subTitle} variant="h5">
          Inscriptions
        </Typography>
      )}
      <List disablePadding>
        {bookedLessonsDiscount['X1'].length > 0 && (
        <Typography className={classes.reducTitle} variant="h6">
          Pas de réduction
        </Typography>
        )}
        {bookedLessonsDiscount['X1'].map(lesson => (
            <div key={lesson.id}>
              <ListItem className={classes.listItem} key={lesson.id}>
                <ListItemText primary={lesson.name} secondary={'Du '+moment(lesson.recurenceBegin).format('DD/MM/YYYY')+' au '+moment(lesson.recurenceEnd).format('DD/MM/YYYY')} />
                <Typography variant="body2">{lesson.pricing.totalPrice}€</Typography>
              </ListItem>
            </div>
        ))}
        {bookedLessonsDiscount['X2'].length > 0 && (
          <Typography className={classes.reducTitle} variant="h6">
          Double réduction
        </Typography>
        )}
        {bookedLessonsDiscount['X2'].map(lesson => (
            <div key={lesson.id}>
              <ListItem className={classes.listItem} key={lesson.id}>
                <ListItemText primary={lesson.name} secondary={'Du '+moment(lesson.recurenceBegin).format('DD/MM/YYYY')+' au '+moment(lesson.recurenceEnd).format('DD/MM/YYYY')} />
                <Typography className={classes.reducAmount} variant="body2"><strike>{lesson.pricing.totalPrice}</strike>€</Typography>
                <Typography variant="body2">{lesson.pricing.totalPrice2X}€</Typography>
              </ListItem>
            </div>
        ))}
        {bookedLessonsDiscount['X3'].length > 0 && (
          <Typography className={classes.reducTitle} variant="h6">
            Triple réduction
          </Typography>
        )}
        {bookedLessonsDiscount['X3'].map(lesson => (
            <div key={lesson.id}>
              <ListItem className={classes.listItem} key={lesson.id}>
                <ListItemText primary={lesson.name} secondary={'Du '+moment(lesson.recurenceBegin).format('DD/MM/YYYY')+' au '+moment(lesson.recurenceEnd).format('DD/MM/YYYY')} />
                <Typography className={classes.reducAmount} variant="body2"><strike>{lesson.pricing.totalPrice}</strike>€</Typography>
                <Typography variant="body2">{lesson.pricing.totalPrice3X}€</Typography>
              </ListItem>
            </div>
        ))}
        {!user.paidYearlyTax && orderResume.total > 0 && !admin && (
          <ListItem className={classes.listItem}>
            <ListItemText primary="Paiement annuel pour assurance" />
            <Typography variant="body2">
              35€
            </Typography>
          </ListItem>
        )}
        {discounts.length > 0 && (
          <Typography className={classes.reducTitle} variant="h6">
            Bon de réduction
          </Typography>
        )}
        {discounts.map(discount => (
          <div key={discount.id}>
            <ListItem className={classes.listItem}>
              <ListItemText primary={discount.discount} />
              <Typography variant="body2">
              -{discount.value}€
            </Typography>
            </ListItem>
          </div>
        ))}
        <ListItem className={classes.listItem}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" className={classes.total}>
            {orderResume.total+orderResume.yearlyTax}€
          </Typography>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary="Total mensuel" />
          <Typography variant="subtitle1" className={classes.total}>
            {orderResume.totalMonthly}€ pendant {orderResume.subDuration} mois
          </Typography>
        </ListItem>
      </List>
      <Container className={classes.discount}>
        { adminMode ? (
          <React.Fragment>
            <TextField
              label="ADMIN REDUCTION"
              id="adminReduc"
              value={adminDiscountAmount}
              onChange={changeAdminDiscountAmount}
            />
            <Button variant="contained" color="primary" onClick={validateAdminDiscount}>
              Ajouter
            </Button>
          </React.Fragment>
        ):(
          <React.Fragment>
            <TextField
                label="Code de réduction"
                id="reduc"
                value={discountCode}
                onChange={changeDiscountCode}
            />
            <Button variant="contained" color="primary" onClick={validateDiscountCode}>
              Ajouter
            </Button>
          </React.Fragment>
        )}
      </Container>
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

export default OrderResume