const INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
const NOT_AUTHENTICATED = "NOT_AUTHENTICATED"
const SESSION_EXPIRED = "SESSION_EXPIRED"

export function getErrorMessage(error) {
  if(error) {
    switch(error.message) {
      case INVALID_CREDENTIALS:
        return {
          message: "L'email ou le mot de passe est incorrect", 
          variant: "error",
          show: true
        }
      case NOT_AUTHENTICATED:
        return {
          message: "Vous n'êtes pas connecté", 
          variant: "error",
          show: true
        }
      case SESSION_EXPIRED:
        return {
          message: "Votre session a expiré", 
          variant: "error",
          show: true
        }
      default:
        return {
          message: "Cet email ne semble pas exister", 
          variant: "error",
          show: true
        }
        break
    }
  } 
}