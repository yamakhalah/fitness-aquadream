import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const AuthRoute = ({ component: Component, user,  ...rest}) => {
  return(
    <Route {...rest} render={props => (
      user.isAuthenticated 
        ? <Component {...props} />
        : <Redirect to='/login' />
    )} />
  )
}


export default AuthRoute