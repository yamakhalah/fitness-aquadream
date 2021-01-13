require('dotenv').config()
var mailer = require('nodemailer')
var moment = require('moment-timezone')

moment.locale('fr')
moment.tz.setDefault('Europe/Brussels')

export const FROM = 'noreply@aquadream-temploux.be'

export function TEST() {
  return '<p>TEST</p>'
}

export function SIGN_UP(user) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous confirmons la création de votre compte sur www.aquadream-temploux.be</p></br>'+
  '<p>Informations: </p>'+
  '<p>Email: '+user.email+'</p>'+
  '<p>Mot de passe: Seul vous le connaissez.</p></br>'+
  '<p>Nous vous souhaitons une bonne journée.</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function USE_CREDIT(user, lessonDay) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
    '<p>Nous vous confirmons l\'utilisation de votre crédit pour le cours en date du '+moment(lessonDay.dayDate).format('DD/MM/YYYY')+' de '+moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')+' à '+moment(lessonDay.hour.end, 'HH:mm').format('HH:mm')+'</p>'+
    '<p>Vous pouvez y accéder via votre calendrier sur https://www.app.aquadream-temploux.be</p>'+
    '<p>Cordialement,</p>'+
    '<p>L\'équipe Aquadream</p>'+
    '</br></br>'+
    '<em>PS: Ne répondez pas à ce message</em>'
}

export function RESET_MAIL(user) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
    '<p>Suite à votre demande votre mot de passe a été réinitialisé</p>'+
    '<p>Nouveau mot de passe: '+user.password+'</p>'+
    '<p>Changez le rapidement via votre profil sur www.aquadream.be</p>'+
    '<p>Cordialement,</p>'+
    '<p>L\'équipe Aquadream</p>'+
    '</br></br>'+
    '<em>PS: Ne répondez pas à ce message</em>'
}

export function CANCEL_LESSON_DAY(user, lessonDay, message) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous signalons que votre cours de '+lessonDay.lesson.name+' prévu le '+moment(lessonDay.dayDate).format('DD/MM/YYYY')+' de '+moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')+' à '+moment(lessonDay.hour.end, 'HH:mm').format('HH:mm')+' a été annulé.</p>'+
  '<h4>Motif:</h4>'+
  '<p>'+message+'</p>'+
  '<p>Rassurez-vous, un avoir a été émis et peut être utilisé gratuitement pendant un an pour n\'importe quel cours. Rendez vous sur l\'onglet crédit pour l\'utiliser</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function CANCEL_LESSON_DAY_BY_USER(user, lessonDay) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous confirmons l\'annulation de votre cours prévu le '+moment(lessonDay.dayDate).format('DD/MM/YYYY')+' de '+moment(lessonDay.hour.begin, 'HH:mm').format('HH:mm')+' à '+moment(lessonDay.hour.end, 'HH:mm').format('HH:mm')+'.</p>'+
  '<p>Un crédit vous a été généré. Retrouvez-le sur https://www.app-aquadream-temploux.be/credit</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function CANCEL_SUBSCRIPTION_DISCOUNT(discount, subscription) {
  return '<p>Bonjour '+subscription.user.firstName+' '+subscription.user.lastName+'</p>'+
  '<p>Nous vous informons qu\'un de vos abonnement a été annulé.</p>' +
  '<p>Si vous aviez déjà payé un bon d\'achat d\'une valeur équivalente vous a été généré. Vous pourrez le sélectionner lors d’une prochaine réservation.</p>' +
  '</br></br>'+
  '<p>Montant remboursé: '+discount.value+'€</p>' +
  '<p>Code Voucher: '+discount.discount.toString()+'€</p>' +
  '</br></br>'+
  '<p>Plus d\informations via l\'application Aquadream</p>' +
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function CANCEL_SUBSCRIPTION_REFUND(refund, subscription) {
  return '<p>Bonjour '+subscription.user.firstName+' '+subscription.user.lastName+'</p>'+
  '<p>Nous vous informons qu\'un de vos abonnement a été annulé.</p>' +
  '<p>Si vous aviez déjà payé un remboursement a été généré et vous recevrez prochainement l\'argent déjà versé sur votre compte.</p>' +
  '</br></br>'+
  '<p>Montant remboursé: '+refund+'€</p>' +
  '</br></br>'+
  '<p>Plus d\informations via l\'application Aquadream</p>' +
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function PRE_CANCEL_SUBSCRIPTION(subscription) {
  return '<p>Bonjour '+subscription.user.firstName+' '+subscription.user.lastName+'</p>'+
  '<p>Nous vous informons qu\'un de vos abonnement a été annulé.</p>' +
  '<p>Etant donné que vous n\'aviez pas encore payé celui-ci, vous ne recevez pas de bon d\'achat.</p>' +
  '</br></br>'+
  '<p>Plus d\informations via l\'application Aquadream</p>' +
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}


export function OPEN_LESSON(user, lesson) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p> Nous vous informons que l\'abonnement '+ lesson.name +' débutant le '+moment(lesson.recurenceBegin).format('DD/MM/YYYY')+' est maintenant ouvert. </p>'+
  '<p> Vous pouvez dès à présent aller réserver une place pour ce cours via la page de réservation sur www.app.aquadream-temploux.be/booking </p>'+
  '<p> Dépechez vous, nous ne réservons pas de place mais vous êtes bien entendu prévenu(e) en avance ! </p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function PAYMENT_REMINDER(user, paymentReminder, paymentReminderURL) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous contactons car nous n\'avons pas réussi à vous débiter la dernière mensualité de votre abonnement.</p>'+
  '<p>Nous sommes certains qu\'il s\'agit d\'une erreur, c\'est pourquoi nous vous demandons de payer cette mensualité le plus rapidement possible. Dans le cas où vous ne payez pas cette mensualité, votre abonnement sera malheureusement annulé</p>'+
  '<p>Par mesure de prévention, il vous est impossible d\'afficher les cours concernés sur le calendrier de notre application et donc d\'annuler ceux-ci. Vos cours seront à nouveau affichés dès que vous serez en ordre de paiement.</p>'+
  '<p>Montant: '+paymentReminder.amount+'€</p>'+
  '<p>Lien de paiement: '+paymentReminderURL+'</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function CONFIRM_SUBSCRIPTION(user) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p> Nous vous informons que votre paiement a été accepté et que votre abonnement a été crée </p>'+
  '<p> Pour voir l\'état de votre abonnement rendez vous sur https://www.app.aquadream-temploux.be/subscription </p>'+
  '</br>'+
  '<p> Vous ne voyez pas votre commande ? Contactez paiement@aquadream-temploux.be </p>'+
  '<p> Pour toute autre question contactez nous sur contact@aquadream-temploux.be </p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function CHANGE_SUBSCRIPTION(user, oldLesson, newLesson) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous informons que nous avons modifié un de vos abonnement suite à votre demande.</p>'+
  '<p>Le cours '+oldLesson.name+' à '+moment(oldLesson.recurenceBegin).format('HH:mm')+' a été remplacé par '+newLesson.name+' à '+moment(newLesson.recurenceBegin).format('HH:mm')+'</p>'+
  '<p>Si vous êtes pas à l\'origine de cette demande contactez nous via info@aquadream-temploux.be</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function ADMIN_PRE_BOOKING(user, subscription, checkout) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous informons que notre équipe vous a réservé une place pour un cours</p>'+
  '<p>Afin de valider votre abonnement, merci de cliquer sur le lien ci-dessous afin de payer celui-ci. Si vous ne payez pas, les cours ne seront pas accessibles.</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function ADMIN_DISCOUNT(user, discount) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p>Nous vous informons que notre équipe vous a généré un bon d\achat utilisable pendant 1 an</p>'+
  '<p>Ce bon, d\'une valeur de '+discount.value+'€ peut être utilisé durant la réservation d\'un cours dans le champs prévu à cet effet.</p>'+
  '<p>Code à utiliser: '+discount.discount+'</p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function ADMIN_CREATE_SUBSCRIPTION(data) {
  var lessonsDetail = ""
  for(const lesson of data.lessons) {
    lessonsDetail += "<p>"+lesson.name+" du "+moment(lesson.recurenceBegin).format("DD/MM/YYYY")+" au "+moment(lesson.recurenceEnd).format("DD/MM/YYYY")+" de "+moment(lesson.recurenceBegin).format("HH:mm")+" à "+moment(lesson.recurenceEnd).format("HH:mm")+"</p>"
  }
  return '<p>Bonjour '+data.user.firstName+' '+data.user.lastName+'</p>'+
  '<p>Nous vous informons que notre équipe vous a réservé une place pour un abonnement Aquadream !</p>'+
  '<p>Si vous ne souhaitez pas être inscrit(e) à cet abonnement veuillez nous contacter via aquadreamtemploux@gmail.com</p>'+
  '<p>Liste des cours: </p>'+
  lessonsDetail +
  '<p>Total: '+data.total+'€ </p>'+
  '<p>Total Mensuel: '+data.totalMonth+'€ </p>'+
  '<p>ATTENTION: Afin de confirmer votre abonnement veuillez effectuer le premier versement en suivant ce lien sécurisé: '+process.env.PRIORITARY_BOOKING_REDIRECT_URL+'/'+data.subscription+' </p>'+
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function ADMIN_MAIL(message) {
  return '<p>Bonjour,</p>'+
  '<p>Ceci est un message de la part de l\'équipe d\'Aquadream:</p>' +
  '</br></br>'+
  '<p>'+message+'</p>' +
  '<p>Cordialement,</p>'+
  '<p>L\'équipe Aquadream</p>'+
  '</br></br>'+
  '<em>PS: Ne répondez pas à ce message</em>'
}

export function SUPPORT_MAIL(user, message) {
  return '<p>ADMIN SUPPORT</p>'+
  '<p>Demande de support de la part de: ' +user.email+ '</p>'+
  '<p>ID: '+user.id+'</p>' +
  '</br>'+
  '<p>Message: '+message+'</p>'
}

var transport = mailer.createTransport({
  pool: true,
  name: 'aquadream-temploux.be',
  host: 'ssl0.ovh.net',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD
  }
})

export function sendMail(from, to, subject, html) {
  var content = {
    from: from,
    to: to,
    subject: subject,
    html: html
  }
  console.log(content)

  transport.sendMail(content, (error, response) => {
    if(error) {
      console.log(error)
      return false
    }else if(response){
      return true
    }
  })
}

export function sendMultipleMail(from, to, subject, html) {
  var result = true
  for(const element of to) {
    var content = {
      from: from,
      to: element.email,
      subject: subject,
      html: html
    }

    transport.sendMail(content, (error, response) => {
      if(error) {
        console.log(error)
        result = false
      }
    })
  }
  return result
}