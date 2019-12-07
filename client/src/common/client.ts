import ApolloClient from 'apollo-boost';
import gql from "graphql-tag";

const client = new ApolloClient({
  uri: 'http://localhost:8000',
});

export const ScriptsFragments = {
  metadata: gql`
    fragment scriptMetadata on Meatadata {
      error
      functions {
        name
        docstring
        returns
        parameters {
          default
          annotation
          kind
          name
        }
      }
    }
  `
}

export default client
