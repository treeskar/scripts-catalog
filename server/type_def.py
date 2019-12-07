from ariadne import gql


type_defs = gql("""
  type Script {
    path: ID,
    source: String
    metadata: Metadata
  }

  type Metadata {
    error: String
    functions: [FunctionMetadata]
  }

  type FunctionMetadata {
    name: String
    docstring: String
    returns: String
    parameters: [ParameterMetadata]
  }

  type ParameterMetadata {
    annotation: String
    default: String
    kind: String
    name: String
  }

  input ScriptInput {
    path: ID
    source: String
  }

  type Query {
    scripts: [Script]
    script(path: ID!): Script
  }

  type UpdateResponse {
    error: String
    path: ID
    source: String
    metadata: Metadata
  }

  type ExecResponse {
    data: String
  }

  type Mutation {
    addScript(script: ScriptInput): Script
    updateScript(path: ID, source: String): UpdateResponse
    renameScript(path: ID, newPath: ID): UpdateResponse
    execSource(path: ID, functionCall: String): ExecResponse
  }
""")
