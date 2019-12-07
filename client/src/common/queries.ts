import gql from "graphql-tag";

export const GET_SCRIPTS = gql`
  {
    scripts {
      path
      metadata {
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
    }
  }
`;

export const GET_SCRIPT = gql`
  query getScript($path: ID!) {
    script(path: $path) {
      path
      source
      metadata {
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
    }
  }
`;

export const UPDATE_SCRIPT = gql`
  mutation UpdateScript($path: ID!, $source: String) {
    updateScript(path: $path, source: $source) {
      error
      path
      source
      metadata {
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
    }
  }
`;

export const EXECUTE_SOURCE = gql`
  mutation execSource($path: ID!, $functionCall: String) {
  execSource(path: $path, functionCall: $functionCall) {
    data
  }
}
`;
