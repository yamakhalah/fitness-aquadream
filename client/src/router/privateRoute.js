import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = ({ component: Component, user, needAdmin, needTeacher, ...rest}) => {
  
  if(((needAdmin && user.isAdmin) && (needTeacher && user.isTeacher)) || ((needAdmin && user.isAdmin) && !needTeacher)  || (!needAdmin && (needTeacher && user.isTeacher))) {
    return (
      <Route {...rest} render={props => (
        <Component {...props} />
      )}
      />
    )
  }else{
    return (
      <Route {...rest} render={props => (
        <Redirect to='/' />
      )}
      />
    )
  }
}


export default PrivateRoute