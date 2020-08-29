import moment from 'moment'
moment.locale('fr')

export  function dateToDayString(date) {
  var tmp = moment(date)
  switch(tmp.day()) {
    case 1:
      return 'Lundi'
    case 2:
      return 'Mardi'
    case 3:
      return 'Mercredi'
    case 4:
      return 'Jeudi'
    case 5:
      return 'Vendredi'
    case 6:
      return 'Samedi'
    case 0: 
      return 'Dimanche'
  }
}