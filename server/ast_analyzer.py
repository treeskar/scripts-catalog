import sys
import os.path
import ast
import inspect
# show_ast https://github.com/hchasestevens/show_ast visualize ast tree


AST_TYPE_MAP = {
  ast.List: list,
  ast.Tuple: tuple,
  ast.Str: set,
  ast.Dict: dict
}

class Parameter(inspect.Parameter):

  def toDict(self):
    return {
      "annotation": self.annotation,
      "default": self.default,
      "kind": self.kind.name,
      "name": self.name
    }


class NodeVisistor(ast.NodeVisitor):

  def __init__(self):
    self.report = dict()
    self._stmt = None

  def visit_FunctionDef(self, node):
    # signature = inspect.signature(node)
    self._stmt = {
      "name": node.name,
      "docstring": ast.get_docstring(node),
      "returns": NodeVisistor.__get_node_value(node.returns),
      "parameters": []
    }
    self.report[node.name] = self._stmt
    self.generic_visit(node)

  def visit_arguments(self, node):
    """
    args = positional arguments
    default = default positional arguments from last (need to use offset)
    kwonlyargs = key only arguments 
    kw_defaults = defaults key only arguments
    kwarg = **kwargs - rest of keywords arguments
    vararg = *args - rest of positional arguments

    kind = keyword_only|positional_only|positional_or_keyword
    """
    if self._stmt:
        args = NodeVisistor.__get_params(
          node.args, node.defaults, inspect.Parameter.POSITIONAL_OR_KEYWORD)
        self._stmt['parameters'] += args
        if node.vararg:
          vararg_parameter = Parameter(
            name=node.vararg.arg,
            kind=inspect.Parameter.VAR_POSITIONAL,
            annotation=NodeVisistor.__get_node_value(node.vararg.annotation)
          )
          self._stmt['parameters'].append(vararg_parameter)
        kwonlyargs = NodeVisistor.__get_params(
          node.kwonlyargs,
          node.kw_defaults,
          inspect.Parameter.KEYWORD_ONLY
        )
        self._stmt['parameters'] += kwonlyargs
        if node.kwarg:
          vararg_parameter = Parameter(
            name=node.kwarg.arg,
            kind=inspect.Parameter.VAR_KEYWORD,
            annotation=NodeVisistor.__get_node_value(node.kwarg.annotation)
          )
          self._stmt['parameters'].append(vararg_parameter)

    self.generic_visit(node)

  @staticmethod
  def __get_params(args=[], defaults=[], kind=inspect.Parameter.POSITIONAL_OR_KEYWORD) -> [inspect.Parameter]:
    padding = [None] * (len(args) - len(defaults))
    return [
      Parameter(
        name=arg.arg,
        kind=kind,
        default=NodeVisistor.__get_node_value(default),
        annotation=NodeVisistor.__get_node_value(arg.annotation)
      ) for arg, default in zip(args, padding + defaults)
    ]

  @staticmethod
  def __get_node_value(node):
    if not isinstance(node, ast.AST):
      return None
    if (isinstance(node, (ast.Tuple, ast.List, ast.Set))):
      values = map(NodeVisistor.__get_node_value, node.elts)
      node_type = type(node)
      return AST_TYPE_MAP[node_type](values)
    if (isinstance(node, ast.Dict)):
      values = map(NodeVisistor.__get_node_value, node.values)
      keys = map(NodeVisistor.__get_node_value, node.keys)
      return dict(zip(keys, values))
    return getattr(node, node._fields[0], None)


def analyze_source(source: str):
  try:
    tree = ast.parse(source)
  except SyntaxError as error:
    return {"error": str(error)}
  nodeVisistor = NodeVisistor()
  nodeVisistor.visit(tree)
  metadata = list(nodeVisistor.report.values())
  return {"functions": metadata}
