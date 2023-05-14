import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App() {
  const routeViews = useRoutes(routes);
  return <main>{routeViews}</main>;
}

export default App;
