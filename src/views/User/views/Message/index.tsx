import { UserChatLogs } from '@/services/typing';
import { ipcRenderer } from 'electron';
import { useCallback } from 'react';
import MessageList from './MessageList';

const data = [
  {
    uid: '8549947001',
    friend: '8549947000',
    icon: '',
    nickname: '管理员',
    logs: [
      {
        role: 0,
        content: '这是测试用户1的聊天内容',
        image: '',
        hidden: false,
        createTime: Date.now() - 1000 * 60 * 60 * 24,
        cid: '0000000819f85b2b270b3fe2',
        isRead: false,
      },
      {
        role: 1,
        content: '这是测试用户2给测试用户1回复的测试聊天内容',
        image: '',
        hidden: false,
        createTime: Date.now(),
        cid: '0000000819f85b2b270b3fe3',
        isRead: false,
      },
    ],
  },
];

function MessageView() {
  const handleOpenChat = useCallback(({ logs, ...data }: UserChatLogs) => {
    ipcRenderer.send('open-win', {
      pathname: `/chat/${JSON.stringify(data)}`,
      width: 560,
      height: 500,
    });
  }, []);

  return (
    <MessageList itemKey='friend' data={data} onItemClick={handleOpenChat} />
  );
}

export default MessageView;
