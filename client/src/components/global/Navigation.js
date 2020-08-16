import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import { Tooltip, AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { ShoppingCart, Home, ChevronLeft, Add, People, DateRange, Menu, Today, Euro, Payment } from '@material-ui/icons'
import { GET_AUTHENTIFICATION } from '../../store/authentification'
import { useApolloClient } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import '../../style/css/navigation.css'

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
    color: '#FFFFFF'
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
    backgroundColor:theme.palette.secondary.main,
    color: '#FFFFFF'
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
    backgroundColor:theme.palette.secondary.main,
    color: '#FFFFFF'
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
    padding: theme.spacing(3),
  },
  title: {
    color: '#FFFFFF'
  },
  white: {
    color: '#FFFFFF'
  },
  list: {
    paddingTop: 0,
  }
}));

export default function Navigation(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const client = useApolloClient()
  const history = useHistory()
  const user = client.readQuery({query: GET_AUTHENTIFICATION}).Authentification
  const isAuthenticated = user.isAuthenticated  
  const isAdmin = user.isAdmin
  const isTeacher = user.isTeacher

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
      history.push('/login')
    })
  }

  let loginButton, logoutButton, changePasswordButton, menuButton, adminDrawer, teacherDrawer
    if(isAuthenticated) {
      menuButton = 
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
          <Menu />
        </IconButton>

      changePasswordButton =
      <Link to="/change-password" className="topNavItem">
        <Button className={classes.title}>
          Changer de mot de passe
        </Button>
      </Link>

      logoutButton = 
      <Button className={classes.title} onClick={logout.bind(this)}>
        Se Déconnecter
      </Button>
    } else {
      loginButton = 
      <Link to="/login" className="topNavItem">
        <Button className={classes.title}>
          Login
        </Button>
      </Link>
    }
    if(isAdmin) {
      adminDrawer =
      <div>
      <Divider/>
      <h3 className="center">Admin</h3>
      <List className="drawer">
        <Link to="/createLesson" className="leftNavItem">
          <Tooltip title="Créer un cours">
            <ListItem button key="createLesson" className={classes.white}>
              <ListItemIcon className={classes.white}><Add /></ListItemIcon>
              <ListItemText>Créer un cours</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Link to="/adminSubscription" className="leftNavItem">
          <Tooltip title="Gérer les abonnements">
            <ListItem button key="adminSubscription" className={classes.white}>
              <ListItemIcon className={classes.white}><Payment /></ListItemIcon>
              <ListItemText>Abonnements</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Link to="/adminLesson" className="leftNavItem">
        <Tooltip title="Gérer vos cours">
          <ListItem button key="adminLesson" className={classes.white}>
            <ListItemIcon className={classes.white}><DateRange /></ListItemIcon>
            <ListItemText>Cours</ListItemText>
          </ListItem>
        </Tooltip>
        </Link>
        <Link to="/adminLessonDay" className="leftNavItem">
          <Tooltip title="Gérer les cours quotidiens">
            <ListItem button key="adminLessonDay" className={classes.white}>
              <ListItemIcon className={classes.white}><Today /></ListItemIcon>
              <ListItemText>Cours Journaliers</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Link to="/adminUser" className="leftNavItem">
          <Tooltip title="Gérer les utilisateurs">
            <ListItem button key="adminUser" className={classes.white}>
              <ListItemIcon className={classes.white}><People /></ListItemIcon>
              <ListItemText>Utilisateurs</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Link to="/adminCredit" className="leftNavItem">
          <Tooltip title="Gérer les crédits">
            <ListItem button key="adminCredit" className={classes.white}>
              <ListItemIcon className={classes.white}><Euro /></ListItemIcon>
              <ListItemText>Crédits</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
      </List>
      </div>
    }
    if(isTeacher) {
      teacherDrawer =
      <div>
      <Divider/>
      <h3 className="center">Prof</h3>
      <List>
        <Tooltip title="Gérer votre calendrier">
          <ListItem disabled={true} button key="teacherCalendar" className={classes.white}>
            <ListItemIcon className={classes.white}><Home /></ListItemIcon>
            <ListItemText>Créer un cours</ListItemText>
          </ListItem>
        </Tooltip>
      </List>
      </div>
    }

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
         <Toolbar>
         {isAuthenticated &&
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: open,
              })}
            >
              <MenuIcon />
            </IconButton>
         }
            <Typography variant="h6" noWrap className={classes.title}>
              Aquadream
            </Typography>
            <div className="buttonBar">
              {changePasswordButton}
              {loginButton}
              {logoutButton}
            </div>
          </Toolbar>
      </AppBar>
      {isAuthenticated &&
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={toggleDrawer} style={{color:'#FFFFFF'}}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <List className={classes.list}>
            {adminDrawer}
            {teacherDrawer}
            <Divider/>
            <h3 className="center">Client</h3>
            <Link to="/" className="leftNavItem">
              <Tooltip title="Accueil">
                <ListItem button key="home">
                  <ListItemIcon className={classes.white}><Home /></ListItemIcon>
                  <ListItemText className={classes.white}>Accueil</ListItemText>
                </ListItem>
              </Tooltip>
            </Link>
            <Link to="/subscription" className="leftNavItem">
              <Tooltip title="Abonnements">
                <ListItem button key="subscription" className={classes.white}>
                  <ListItemIcon className={classes.white}><Payment /></ListItemIcon>
                  <ListItemText>Abonnements</ListItemText>
                </ListItem>
              </Tooltip>
            </Link>
            <Link to="/credit" className="leftNavItem">
              <Tooltip title="Crédits">
                <ListItem button key="credit" className={classes.white}>
                  <ListItemIcon className={classes.white}><Euro /></ListItemIcon>
                  <ListItemText>Crédits</ListItemText>
                </ListItem>
              </Tooltip>
            </Link>
            <Link to="/booking" className="leftNavItem">
              <Tooltip title="Réserver un cours">
                <ListItem button key="reservation" className={classes.white}>
                  <ListItemIcon className={classes.white}><ShoppingCart /></ListItemIcon>
                  <ListItemText>Réservation</ListItemText>
                </ListItem>
              </Tooltip>
            </Link>
          </List>
        </Drawer>
      }
    </div>
  );
}