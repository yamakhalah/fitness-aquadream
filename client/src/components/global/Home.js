import React from 'react';
import { withApollo } from 'react-apollo'
import { GET_USERS } from '../../database/query/userQuery'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
    
  }

  getUsers = () => {
    this.props.client.query({
      query: GET_USERS
    })
    .then(result => {
      //console.log(result)
    })
    .catch(error => {
      console.log(error)
    })
  }

  render() {
    this.getUsers()
    return(
      <div>Test</div>)

  }
}

export default withApollo(Home)