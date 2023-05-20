import '@/assets/index.scss';
import 'antd/dist/reset.css';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App() {
  const routeViews = useRoutes(routes);
  return routeViews;
}

export default App;
