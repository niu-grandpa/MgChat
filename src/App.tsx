import { useRoutesWithMiddleware } from 'react-router-middleware-plus';
import routes from './routes';

function App() {
  const element = useRoutesWithMiddleware(routes);
  return <main>{element}</main>;
}

export default App;
