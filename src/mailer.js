require('dotenv').config()
var mailer = require('nodemailer')
var moment = require('moment')
moment.locale('fr')

export const FROM = 'noreply@aquadream-temploux.be'

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

export function CANCEL_SUBSCRIPTION_DISCOUNT(discount, subscription, amount) {
  return '<p>Bonjour '+subscription.user.firstName+' '+subscription.user.lastName+'</p>'+
  '<p>Nous vous informons qu\'un de vos abonnement a été annulé.</p>' +
  '<p>Si vous aviez déjà payé un bon d\'achat d\'une valeur équivalente vous a été généré. Vous pourrez le sélectionner lors d’une prochaine réservation.</p>' +
  '</br></br>'+
  '<p>Montant remboursé: '+amount+'€</p>' +
  '<p>Code Voucher: '+(discount.discount) +'€</p>' +
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

export function CONFIRM_SUBSCRIPTION(user) {
  return '<p>Bonjour '+user.firstName+' '+user.lastName+'</p>'+
  '<p> Nous vous informons que votre paiement a été accepté et que votre abonnement a été crée </p>'+
  '<p> Pour voir l\'état de votre abonnement rendez vous sur https://www.app.aquadream-temploux.be/subscription </p>'+
  '</br></br>'+
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

var transport = mailer.createTransport({
  host: "ssl0.ovh.net",
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

  transport.sendMail(content, (error, response) => {
    if(error) {
      return false
    }else{
      return true
    }
    transport.close()
  })
}

export function sendMultipleMail(from, to, subject, html) {
  to.forEach(element => {
    var content = {
      from: from,
      to: element,
      subject: subject,
      html: html
    }

    transport.sendMail(content, (error, response) => {
      if(error) {
        console.log(error)
        return false
      }
      transport.close()
    })
  });

}