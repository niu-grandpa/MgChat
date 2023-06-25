import { MessageLogs } from '@/services/typing';
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
  // 1.获取所有聊天记录，本地有数据则不请求服务器。
  // 2.监听广播消息中from或to都是自身uid的数据。
  // 3.与好友聊天时，把自己的uid和好友uid传给聊天窗口去查询记录。

  const handleOpenChat = useCallback(({ logs, ...info }: MessageLogs) => {
    ipcRenderer.send('open-win', {
      pathname: `/chat/${JSON.stringify(info)}`,
      width: 560,
      height: 500,
    });
  }, []);

  return (
    <MessageList itemKey='friend' data={data} onItemClick={handleOpenChat} />
  );
}

export default MessageView;
