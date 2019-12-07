export type FunctionDefType = {
  name: string
  docstring: string
  returns: string
  parameters: FunctionDefParameterType[]
}

export type FunctionDefParameterType = {
  name: string  
  default: string
  annotation: string
  kind: string  
}

export type MetadataType = {
  error: string
  functions: FunctionDefType[] 
}

export type ScriptType = {
  path: string
  metadata: MetadataType
}
