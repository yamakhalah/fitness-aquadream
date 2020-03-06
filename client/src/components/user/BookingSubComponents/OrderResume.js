import React, { useEffect } from 'react'
import moment from 'moment'
import { List, ListItem, ListItemText, Typography, Container} from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'

moment.locale('fr')

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: 'theme.palette.background.paper',
    padding: theme.spacing(3),
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

const OrderResume = ({ handleFinalPriceCallBack, preBookedLessons, bookedLessons, fUser}) => {
  const classes = useStyles()
  const [user, setUser] = React.useState(fUser())
  const [needReRender, setNeedReRender] = React.useState(false)
  const [totalPayement, setTotalPayement] = React.useState(0)
  const [monthlyPayement, setMonthlyPayement] = React.useState([0,0,0,0,0,0,0,0,0,0,0,0])
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
      if(!user.paidYearlyTax){
        tax = 35
      }
      var orderResume = {
        recurenceBegin: closestRecurenceBegin.toISOString(true),
        recurenceEnd: closestRecurenceEnd.toISOString(true),
        subDuration: highestMonth,
        total: total,
        totalMonthly: totalMonth,
        yearlyTax: tax,
        lessonsData: lessonsData
      }
      setBookedLessonsDiscount(lBookedLessonsDiscount)
      setOrderResume(orderResume)
      handleFinalPriceCallBack(orderResume)
    }
  }, [needReRender])

  return(
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
        {!user.paidYearlyTax && orderResume.total > 0 && (
          <ListItem className={classes.listItem}>
            <ListItemText primary="Paiement annuel pour assurance" />
            <Typography variant="body2">
              35€
            </Typography>
          </ListItem>
        )}
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
    </Container>
  )
}

export default OrderResume