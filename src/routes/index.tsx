import LazyImport from '@/components/LazyImport';
import { RouteObject } from 'react-router-dom';

export default [
  {
    path: '/',
    index: true,
    element: <LazyImport comp={() => import('../views/Login')} />,
  },
  {
    path: '/user',
    element: <LazyImport comp={() => import('../views/UserPanel')} />,
  },
] as RouteObject[];
