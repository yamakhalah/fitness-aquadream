import React from 'react';
import { 
  Switch,
  Route,
  withRouter
} from 'react-router-dom'
import PrivateRoute from './router/privateRoute'
import AuthRoute from './router/authRoute'
import './App.css';
import { GET_AUTHENTIFICATION } from './store/authentification'
import { useApolloClient } from 'react-apollo'
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
import Navigation from './components/global/Navigation'
import CssBaseline from '@material-ui/core/CssBaseline'
import Footer from './components/global/Footer'
import Login from './components/global/Login'
import SignUp from './components/global/SignUp'
import Reset from './components/global/Reset'
import CreateLesson from './components/admin/CreateLesson'
import AdminUser from './components/admin/AdminUser'
import AdminLesson from './components/admin/AdminLesson'
import AdminLessonDay from './components/admin/AdminLessonDay'
import AdminCredit from './components/admin/AdminCredit'
import AdminSubscription from './components/admin/AdminSubscription'
import AdminPaymentReminder from './components/admin/AdminPaymentReminder'
import Booking from './components/user/Booking'
import Credit from './components/user/Credit'
import CreditUse from './components/user/CreditUse'
import Payement from './components/user/BookingSubComponents/Payement'
import PrioritaryPayement from './components/user/BookingSubComponents/PriorityPayement'
import Home from './components/user/Home'
import ChangePassword from './components/global/ChangePassword'
import Subscription from './components/user/Subscription'
import NotFound from './components/global/404'
import CGVReader from './components/global/CGV'
import ROIReader from './components/global/ROI'
import Support from './components/user/Support'
import PaymentReminder from './components/user/PaymentReminder'
import PaymentReminderCheckout from './components/user/PaymentReminderCheckout'

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(0),
  },
}));

export default function App(props) {
    const classes = useStyles()
    const theme = useTheme()
    const client = useApolloClient()
    const [open, setOpen] = React.useState(false);
    const user = client.readQuery({query: GET_AUTHENTIFICATION}).Authentification
    const history = useHistory()
    const isAuthenticated = user.isAuthenticated  || false
    const isAdmin = user.isAdmin || false
    const isTeacher = user.isTeacher || false

    const toggleDrawer = () => {
      setOpen(!open);
    };
  
    const logout = () => {
      window.localStorage.clear()
      client.resetStore().then(() => {
        history.push('/login')
      })
      .catch(error => {
        console.log(error)
      })
    }

    return (
      <div className="App">
        <CssBaseline/>
        <div className={classes.root}>
        <Navigation />
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Switch>
              <Route exact path="/booking/checkout/:reference" component={Payement} />
              <Route exact path="/booking/prioritary-checkout/:subscription" component={PrioritaryPayement} />
              <Route exact path="/booking/payment-reminder/:paymentReminder" component={PaymentReminder} />
              <Route exact path="/booking/payment-reminder/checkout/:paymentReminder" component={PaymentReminderCheckout} />
              <AuthRoute user={user} component={Home} exact path="/" />
              <AuthRoute user={user} component={Credit} exact path="/credit" />
              <AuthRoute user={user} component={CreditUse} exact path="/creditUse" />
              <AuthRoute user={user} component={Booking} exact path="/booking" />
              <AuthRoute user={user} component={Subscription} exact path="/subscription" />
              <AuthRoute user={user} component={ChangePassword} exact path="/change-password" />
              <AuthRoute user={user} component={Support} exact path="/support" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={CreateLesson} path="/createLesson" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={AdminUser} path="/adminUser" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={AdminLesson} path="/adminLesson" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={AdminLessonDay} path="/adminLessonDay" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={AdminCredit} path="/adminCredit" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={AdminSubscription} path="/adminSubscription" />
              <PrivateRoute user={user} needAdmin={true} needTeacher={false} component={AdminPaymentReminder} path="/adminPaymentReminder" />
              <Route component={Login} path="/login" />
              <Route component={SignUp} path="/signup" />
              <Route component={Reset} path="/reset" />
              <Route component={ROIReader} path="/roi" />
              <Route component={CGVReader} path="/cgv" />
              <Route path="/recovery" />
              <Route  component={NotFound} path="*" />
            </Switch>
          </main>
        </div>
      </div>
    );
  }
