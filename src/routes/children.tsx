import FriendList from '@/views/User/views/Friends';
import GroupList from '@/views/User/views/Group';
import MessageList from '@/views/User/views/Message';
import { RouteObject } from 'react-router-dom';

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
