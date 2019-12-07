import os
from ariadne import ObjectType, QueryType, gql, make_executable_schema
from ariadne.asgi import GraphQL
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from type_def import type_defs
from resolvers import query, mutation

# Define types using Schema Definition Language (https://graphql.org/learn/schema/)
# Wrapping string in gql function provides validation and better error traceback


# Create executable GraphQL schema
schema = make_executable_schema(type_defs, [query, mutation])


# Create an ASGI app using the schema, running in debug mode
graphQL_app = GraphQL(
  schema,
  debug=os.environ.get('DEBUG', True),
)
app = CORSMiddleware(
  graphQL_app,
  allow_headers=['*'],
  allow_origins=['*'],
  allow_methods=['*'],
)

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="0.0.0.0", port=os.environ.get('PORT', 8000))
