import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import client from './common/client';
import './App.scss';

const CatalogLazy = React.lazy(() => import('./catalog/catalog'));
const EditScriptLazy = React.lazy(() => import('./edit/EditScript'));

const Loading: React.FC = () => <p>Loading...</p>

interface IRouteConf {
  path: string | string[] | undefined
  component: React.FC
  props?: {}
  routes?: IRouteConf[]
}

const routes: IRouteConf[] = [
  {
    path: "/",
    props: { exact: true },
    component: CatalogLazy
  },
  {
    path: "/edit/:name",
    component: EditScriptLazy
  },
]


const App: React.FC = () => {
  const routesComponents = routes.map((route, i) => (
    <Route
      key={i}
      path={route.path}
      {...route.props}
    >
      <Suspense fallback={<Loading/>}>
        <route.component/>
      </Suspense>
    </Route>
  ))
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          {routesComponents}
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
