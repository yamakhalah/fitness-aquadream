import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-client'
import { onError } from 'apollo-link-error'
import {ApolloLink, Observable} from 'apollo-link'
import ApolloLinkTimeout from 'apollo-link-timeout';
import { CachePersistor, persistCache } from 'apollo-cache-persist'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import { createHttpLink } from 'apollo-link-http'
import resolver from './store/resolver'
import typeDef from './store/typeDef'
import './index.css';
import App from './App';
import { ThemeProvider } from '@material-ui/styles';
import theme from './style/theme/default'
import * as serviceWorker from './serviceWorker';
require('dotenv').config()

const cache = new InMemoryCache()

const persistor = new CachePersistor({
  cache,
  storage: window.localStorage
})

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'none',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'none',
  },
  mutate: {
    errorPolicy: 'none',
  },
};

const request = async (operation) => {
  const token = localStorage.getItem('token')
  if(token) {
    operation.setContext({
      headers: {
        authorization: token ? token : undefined
      }
    })
  } 
}


const timeoutLink = new ApolloLinkTimeout(100000);


var httpLink = null 
console.log('NODE_ENV: ',process.env.NODE_ENV)
if(process.env.NODE_ENV === 'production') {
  httpLink = createHttpLink({ uri: '/graphql', credentials: 'include' });
}else{
  httpLink = createHttpLink({ uri: 'http://localhost:4000/graphql', credentials: 'include' });
}


const timeoutHttpLink = timeoutLink.concat(httpLink);

const requestLink = new ApolloLink((operation, forward) =>
  new Observable(observer => {
    let handle;
    Promise.resolve(operation)
      .then(oper => request(oper))
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(observer.error.bind(observer));

    return () => {
      if (handle) handle.unsubscribe();
    };
  })
);

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors){
        graphQLErrors.forEach(({ message, locations, path }) => {
          if(message.includes('NOT_AUTHENTICATED') || message.includes('SESSION_EXPIRED')){
            window.localStorage.clear()
            client.resetStore().then(() => {
              window.location.replace('/login')
            })
            .catch(error => {
              console.log(error)
              window.location.replace('/login')
            })
          }
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          )
        });
      //throw new ApolloError(graphQLErrors[0])
      
      }
      if (networkError){
        console.error(`[Network error]: ${networkError}`);
        //throw new Error('NETWORK_ERROR')
      }
    }),
    requestLink,
    httpLink
  ]),
  cache: cache,
  resolvers: resolver,
  typeDefs: typeDef,
  defaultOptions,
  request: (operation) => {
    const token = localStorage.getItem('token')
    if(token) {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers: {
           authorization: token ? token : undefined
        },
      })
    } 
  },
});

/*
const client = new ApolloClient({
  uri: process.env.REACT_APP_URI,
  credentials: 'include',
  fetchOptions: {
    credentials: 'include'
  },
  cache: cache,
  resolvers: resolver,
  typeDefs: typeDef,
  defaultOptions: defaultOptions,
  request: (operation) => {
    const token = localStorage.getItem('token')
    if(token) {
      operation.setContext({
        headers: {
          authorization: token ? token : undefined
        }
      })
    } 
  },
  onError: error => {
    console.log(error)
  }
})
*/

cache.writeData({
  data: {
    Authentification: { isAuthenticated: false, isAdmin: false, isTeacher: false, firstName: '', lastName: '', email: '', userID: '', mollieCustomerID: '', token: '', __typename: "Authentification" }
  }
})

const setupAndRender = async () => {
  cache.writeData({
    data: {
      Authentification: { isAuthenticated: false, isAdmin: false, isTeacher: false, firstName: '', lastName: '', email: '', userID: '', mollieCustomerID: '', token: '', __typename: "Authentification" }
    }
  })
  await persistCache({
    cache,
    storage: window.localStorage
  })
  ReactDOM.render( 
    <ThemeProvider theme={theme}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </ThemeProvider>,
  document.getElementById('root'));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

client.onResetStore(() => {
  persistor.purge()
  cache.writeData({
    data: {
      Authentification: { isAuthenticated: false, isAdmin: false, isTeacher: false, firstName: '', lastName: '', email: '', userID: '', mollieCustomerID: '', token: '', __typename: "Authentification" }
    }
  })
})

setupAndRender()
