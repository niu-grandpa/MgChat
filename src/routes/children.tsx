import LazyImport from '@/components/LazyImport';
import { RouteObject } from 'react-router-dom';

const childrenRoutes = {
  user: [
    {
      path: 'chat',
      element: <LazyImport comp={() => import('@/views/User/views/Chat')} />,
    },
    {
      path: 'message',
      element: <LazyImport comp={() => import('@/views/User/views/Message')} />,
    },
    {
      path: 'friends',
      element: <LazyImport comp={() => import('@/views/User/views/Friends')} />,
    },
    {
      path: 'settings',
      element: '',
    },
    {
      path: 'group',
      element: <LazyImport comp={() => import('@/views/User/views/Group')} />,
    },
  ] as RouteObject[],
};

export default childrenRoutes;
