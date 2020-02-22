export const resolvers = {
  Mutation: {
    newAuthentification: (_, { input }, { cache }) => {
      cache.writeData({
        data: { Authentification: { __typename: 'Authentification', ...input}},
      })
      return true
    },

    updateAuthentification: (_, { input }, { cache }) => {
      cache.writeData({
        data: { Authentification: { __typename: 'Authentification', ...input}},
      })
      return true
    },

    deleteAuthentification: (_, variables, { cache }) => {
      cache.writeData({ data: { Authentification: null }})

      return true
    }
  },
}

export default resolvers