
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