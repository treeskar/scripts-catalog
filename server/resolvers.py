from ariadne import ObjectType, make_executable_schema, MutationType
from ast_analyzer import analyze_source
from multiprocessing.pool import ThreadPool

pool = ThreadPool(processes=1)
SCRIPTS = dict()

query = ObjectType("Query")
mutation = MutationType()

@query.field("scripts")
def getScripts(_, info):
  return SCRIPTS.values()


@query.field("script")
def getScript(_, info, path):
  return SCRIPTS.get(path, None)


def getSourceMetaData(source):
  return analyze_source(source)


@mutation.field("addScript")
def addScript(_, info, script):
  [path, source] = script.values()
  metadata = analyze_source(source)
  SCRIPTS[path] = {
    "path": path,
    "source": source,
    "metadata": metadata,
  }
  return SCRIPTS[path]


@mutation.field("updateScript")
def updateScript(_, info, path, source):
  if path not in SCRIPTS.keys():
    return {"error": f'Script "{path}" not found'}
  metadata = analyze_source(source)
  SCRIPTS[path].update({ "source": source, "metadata": metadata}) 
  return SCRIPTS[path]


@mutation.field("renameScript")
def renameScript(_, info, path, newPath):
  if path not in SCRIPTS.keys():
    return {"data": f'Script "{path}" not found'}
  SCRIPTS[newPath] = {**SCRIPTS[path], "path": newPath}
  del SCRIPTS[path]
  return SCRIPTS[newPath]


def exec_handler(source, path, function_call):
  try:
    codeObejct = compile(source, path, 'exec')
    exec(codeObejct)
    return str(eval(function_call))
  except Exception as error:
    return str(error)


@mutation.field("execSource")
def exec_source(_, info, path, functionCall):
  if path not in SCRIPTS.keys():
    return {"error": f'Script "{path}" not found'}
  source = SCRIPTS[path]["source"]
  try:
    async_result = pool.apply_async(exec_handler, (source, path, functionCall))
    response = async_result.get()
    return {"data": response}
  except Exception as error:
    return {"data": str(error)}

