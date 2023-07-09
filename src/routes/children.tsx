import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const MessageList = lazy(() => import('@/views/User/views/Message'));
const FriendList = lazy(() => import('@/views/User/views/Friends'));
const GroupList = lazy(() => import('@/views/User/views/Group'));

const childrenRoutes = {
  user: [
    {
      path: 'message',
      element: <MessageList />,
    },
    {
      path: 'friends',
      element: <FriendList />,
    },
    {
      path: 'settings',
      element: '',
    },
    {
      path: 'group',
      element: <GroupList />,
    },
  ] as RouteObject[],
};

export default childrenRoutes;
