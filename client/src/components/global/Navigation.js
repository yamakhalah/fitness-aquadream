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
import { ShoppingCart, Home, ChevronLeft, Add, People, DateRange, Menu, Today, Euro } from '@material-ui/icons'
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
    padding: theme.spacing(3),
  },
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

  let loginButton, logoutButton, menuButton, adminDrawer, teacherDrawer
    if(isAuthenticated) {
      menuButton = 
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
          <Menu />
        </IconButton>

      logoutButton = 
      <Button color="inherit" onClick={logout.bind(this)}>
        Se Déconnecter
      </Button>
    } else {
      loginButton = 
      <Link to="/login" className="topNavItem">
        <Button color="inherit">
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
            <ListItem button key="createLesson">
              <ListItemIcon><Add /></ListItemIcon>
              <ListItemText>Créer un cours</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Tooltip title="Gérer les abonnements">
          <ListItem button key="adminSubscription">
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText>Abonnements</ListItemText>
          </ListItem>
        </Tooltip>
        <Link to="/adminLesson" className="leftNavItem">
        <Tooltip title="Gérer vos cours">
          <ListItem button key="adminLesson">
            <ListItemIcon><DateRange /></ListItemIcon>
            <ListItemText>Cours</ListItemText>
          </ListItem>
        </Tooltip>
        </Link>
        <Link to="/adminLessonDay" className="leftNavItem">
          <Tooltip title="Gérer les cours quotidiens">
            <ListItem button key="adminLessonDay">
              <ListItemIcon><Today /></ListItemIcon>
              <ListItemText>Cours Journaliers</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Link to="/adminUser" className="leftNavItem">
          <Tooltip title="Gérer les utilisateurs">
            <ListItem button key="adminUser">
              <ListItemIcon><People /></ListItemIcon>
              <ListItemText>Utilisateurs</ListItemText>
            </ListItem>
          </Tooltip>
        </Link>
        <Link to="/adminCredit" className="leftNavItem">
          <Tooltip title="Gérer les crédits">
            <ListItem button key="adminCredit">
              <ListItemIcon><Euro /></ListItemIcon>
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
          <ListItem button key="teacherCalendar">
            <ListItemIcon><Home /></ListItemIcon>
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
            <Typography variant="h6" noWrap>
              Aquadream
            </Typography>
            <div className="buttonBar">
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
            <IconButton onClick={toggleDrawer}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <List>
            {adminDrawer}
            {teacherDrawer}
            <Divider/>
            <h3 className="center">Client</h3>
            <Tooltip title="Accueil">
              <ListItem button key="home">
                <ListItemIcon><Home /></ListItemIcon>
                <ListItemText>Accueil</ListItemText>
              </ListItem>
            </Tooltip>
            <Tooltip title="Abonnements">
              <ListItem button key="subscription">
                <ListItemIcon><Home /></ListItemIcon>
                <ListItemText>Abonnements</ListItemText>
              </ListItem>
            </Tooltip>
            <Link to="/credit" className="leftNavItem">
              <Tooltip title="Crédits">
                <ListItem button key="credit">
                  <ListItemIcon><Euro /></ListItemIcon>
                  <ListItemText>Crédits</ListItemText>
                </ListItem>
              </Tooltip>
            </Link>
            <Link to="/booking" className="leftNavItem">
              <Tooltip title="Réserver un cours">
                <ListItem button key="reservation">
                  <ListItemIcon><ShoppingCart /></ListItemIcon>
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