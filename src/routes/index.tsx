import LazyImport from '@/components/LazyImport';
import AuthLogin from '@/views/AuthLogin';

export default [
  {
    path: '/',
    middleware: [AuthLogin],
    children: [
      {
        path: 'login',
        element: <LazyImport path='../views/Login' />,
      },
    ],
  },
];
