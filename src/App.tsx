import '@/assets/index.scss';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App() {
  const routeViews = useRoutes(routes);
  return <section style={{ overflow: 'hidden' }}>{routeViews}</section>;
}

export default App;
