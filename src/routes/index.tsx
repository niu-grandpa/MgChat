import LazyImport from '@/components/LazyImport';
import { RouteObject } from 'react-router-dom';
import childrenRoutes from './children';

export default [
  {
    path: '/',
    index: true,
    element: <LazyImport comp={() => import('@/views/Login')} />,
  },
  {
    path: '/user',
    element: <LazyImport comp={() => import('@/views/User')} />,
    children: childrenRoutes.user,
  },
  {
    path: '/register',
    element: <LazyImport comp={() => import('@/views/Register')} />,
  },
  {
    path: '/forget',
    element: <LazyImport comp={() => import('@/views/Forget')} />,
  },
  {
    path: '/find',
    element: '',
  },
  {
    path: '/chat/:uid/:friend',
    element: <LazyImport comp={() => import('@/views/Chat')} />,
  },
] as RouteObject[];
