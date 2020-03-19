import React from 'react'
import { Grid, Container, Card, CardActions, CardContent, CardMedia, Button, Typography, CssBaseline } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import { CustomSnackBar } from '../global/CustomSnackBar'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { GET_CREDITS_FOR_USER } from '../../database/query/creditQuery'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import img from '../../style/img/Aquadream-banner.png'
import moment from 'moment-timezone'
import {lessonSubTypeToString, lessonTypeToString} from '../../utils/enumToString'

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

const styles = theme => ({
  root: {
    marginTop: 25,
    backgroundColor: 'white',
    paddingTop: 30,
    paddingBottom: 30
  },

  card: {
    maxWidth: 345,
  },
  grid: {
    marginTop: 25,
  },

  gridItem: {
    padding: 10
  },

  button: {
    justifyContent: 'center',
    paddingTop: 0
  },
  leftText: {
    textAlign: 'left'
  },
  textPadding: {
    paddingTop: 3
  },
  limitTextPadding: {
    paddingTop: 10
  }
})

class Credit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      credits: [],
      creditsUsed: [],
      errorVariant: 'error',
      errorMessage: '',
      openSnack: false,
    }
  }

  componentDidMount() {
    const user = this.props.client.readQuery({query: GET_AUTHENTIFICATION}).Authentification
    this.props.client.query({
      query: GET_CREDITS_FOR_USER,
      variables: {
        userID: user.userID
      }
    })
    .then(result => {
      var credits = []
      var creditsUsed = []
      result.data.creditsForUser.forEach(element => {
        if(!element.isUsed && moment(element.validityEnd).isSameOrAfter(moment())) {
          credits.push(element)
        } else {
          creditsUsed.push(element)
        }
      });

      this.setState({
        credits: credits,
        creditsUsed: creditsUsed
      })
    })
    .catch(error => {
      this.showSnackMessage('Erreur lors de la récupération des crédits', 'error')
    })
  }

  showSnackMessage = (message, type) => {
    this.setState({
      errorMessage: message,
      errorVariant: type,
      openSnack: true
    })
  }

  handleSnackClose = () => {
    this.setState({ openSnack: false })
  }

  useCredit = (credit) => {
    this.props.history.push('/creditUse', { credit: credit })
  }

  render() {
    const { classes } = this.props
    return(
      <div>
      <Container component="main" maxWidth="xl" className={classes.root}>
      <CssBaseline />
      <Typography component="h1" variant="h5" className={classes.title}>
        Vos crédits
      </Typography>
        {this.state.credits.length > 0 ? (
        <Grid container spacing={1} className={classes.grid}>
        {this.state.credits.map((credit, index) => (
          <Grid item xs={3} sm={3} key={credit.id}>
            <Card className={classes.card}>
                <CardMedia
                  component="img"
                  alt="test"
                  image={img}
                  title="testTitle"
                />
                <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={5} sm={5} className={classes.leftText}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Cours:
                    </Typography>
                    <Typography className={classes.textPadding} variant="body2" color="textSecondary" component="p">
                      Date:
                    </Typography>
                    <Typography className={classes.textPadding} variant="body2" color="textSecondary" component="p">
                      Heure:
                    </Typography>
                    <Typography className={classes.textPadding} variant="body2" color="textSecondary" component="p">
                      Date limite:
                    </Typography>
                  </Grid>
                  <Grid item xs={7} sm={7} className={classes.leftText}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      {credit.lessonDay.lesson.name}
                    </Typography>
                    <Typography className={classes.textPadding} variant="body2" color="textSecondary" component="p">
                      {moment(credit.lessonDay.dayDate).format('DD/MM/YYYY')}
                    </Typography>
                    <Typography className={classes.textPadding} variant="body2" color="textSecondary" component="p">
                      {moment(credit.lessonDay.hour.begin, 'HH:mm').format('HH:mm')} à {moment(credit.lessonDay.hour.end, 'HH:mm').format('HH:mm')}
                    </Typography>
                    <Typography className={classes.textPadding} variant="body2" color="textSecondary" component="p">
                      {moment(credit.validityEnd).format('DD/MM/YY à HH:mm')}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={12} className={classes.limitTextPadding}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Ce crédit est limité à la catégorie {credit.lessonDay.lesson.lessonType.simpleName} -> {credit.lessonDay.lesson.lessonSubType.simpleName}
                    </Typography>
                </Grid>
                </CardContent>
              <CardActions className={classes.button}>
                <Button color="primary" onClick={this.useCredit.bind(this, credit)}>
                  Utiliser
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        </Grid>
        ):(
          <h2>Vous n'avez aucun crédit</h2>
        )}
      </Container>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={this.state.openSnack}
        autoHideDuration={5000}
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

export default withApollo(withRouter(withStyles(styles)(Credit)))