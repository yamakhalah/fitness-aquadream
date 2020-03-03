import aquabike from '../style/img/aquabike1.jpg'
import aquaboxing from '../style/img/aquaboxing.jpg'
import aquafitness from '../style/img/aquafitness.jpg'
import aquagym from '../style/img/aquagym.jpg'
import aquarelaxation from '../style/img/aquarelaxation.jpg'
import aquasirene from '../style/img/aquasirene.jpg'
import bebenageur from '../style/img/bebenageur.jpg'
import prenat from '../style/img/prenat.jpg'
import defaultIMG from '../style/img/classic1.jpg'

export function lessonTypeToString(type) {
  switch(type) {
    case 'BEBE':
      return 'Bébé'
    case 'ENFANT':
      return 'Enfant'
    case 'ADULTE':
      return 'Adulte'
  }
}

export function lessonSubTypeToString(type) {
  switch(type) {
    case 'JARDIN_AQUATIQUE':
      return 'Jardin aquatique'
    case 'ACCOUTUMANCE_A_EAU':
      return 'Accoutumance à l\'eau'
    case 'BEBE_NAGEUR':
      return 'Bébé nageur'
    case 'APPRENTISSAGE_NAGE':
      return 'Aprentissage de la nage'
    case 'PERFECTIONNEMENT_NAGE':
      return 'Perfectionnement de la nage'
    case 'AQUA_SIRENE':
      return 'Aqua sirène'
    case 'AQUA_GYM':
      return 'Aqua gym'
    case 'INITIATION_PLONGEE':
      return 'Initiation plongée'
    case 'INITIATION_WATERPOLO':
      return 'Initiation waterpolo'
    case 'AQUA_BIKING':
      return 'Aqua biking'
    case 'AQUA_FITNESS':
      return 'Aqua fitness'
    case 'AQUA_RELAXATION':
      return 'Aqua relaxation'
    case 'AQUA_ZUMBA':
      return 'Aqua zumba'
    case 'AQUA_BOXING':
      return 'Aqua boxing'
    case 'PREPARATION_PRENATALE':
      return 'Préparation pré-natale'
    case 'OSTEOPATHIE_EAU':
      return 'Ostéopathie de l\'eau'
    case 'POST_NATAL_AQUATIQUE':
      return 'Post-natal aquatique'
  }
}

export function lessonSubTypeToIMG(type) {
  switch(type) {
    case 'JARDIN_AQUATIQUE':
      return defaultIMG
    case 'ACCOUTUMANCE_A_EAU':
      return defaultIMG
    case 'BEBE_NAGEUR':
      return bebenageur
    case 'APPRENTISSAGE_NAGE':
      return defaultIMG
    case 'PERFECTIONNEMENT_NAGE':
      return defaultIMG
    case 'AQUA_SIRENE':
      return aquasirene
    case 'AQUA_GYM':
      return aquagym
    case 'INITIATION_PLONGEE':
      return defaultIMG
    case 'INITIATION_WATERPOLO':
      return defaultIMG
    case 'AQUA_BIKING':
      return aquabike
    case 'AQUA_FITNESS':
      return aquafitness
    case 'AQUA_RELAXATION':
      return aquarelaxation
    case 'AQUA_ZUMBA':
      return defaultIMG
    case 'AQUA_BOXING':
      return aquaboxing
    case 'PREPARATION_PRENATALE':
      return prenat
    case 'OSTEOPATHIE_EAU':
      return defaultIMG
    case 'POST_NATAL_AQUATIQUE':
      return defaultIMG
  }
}