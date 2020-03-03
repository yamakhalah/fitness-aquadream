import { createMuiTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

export default createMuiTheme({
  palette: {
    primary: { main: '#00A9E0'},
    aquawhite: { main: '#F5E1A4'},
    secondary: { main: '#35DDFF'}, 
    secondaryLight: { main: fade('#009131', 0.1) },
    aquabrown: { main: '#653818'},
    red: { main: '#C0392B'}
  }
});