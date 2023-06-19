import { useUserData } from '@/model';
import { UserMessage } from '@/services/typing';
import { useCallback } from 'react';
import MessageList from './MessageList';

const data = [
  {
    who: '8549947000',
    icon: '',
    nickname: '测试用户1',
    message: [
      {
        role: 1,
        content: '这是一段文字描述描述描述',
        image: '',
        hidden: false,
        createTime: Date.now() - 1000 * 60 * 60 * 24,
        cid: '0000000819f85b2b270b3fe2',
        isRead: false,
      },
    ],
  },
  {
    who: '8549947001',
    icon: '',
    nickname: '测试用户2',
    message: [
      {
        role: 1,
        content: '这是一段文字描述描述描述这是一段文字描述描述描述',
        image: '',
        hidden: false,
        createTime: Date.now(),
        cid: '0000000819f85b2b270b3fe21',
        isRead: false,
      },
    ],
  },
];

function MessageView() {
  const userModel = useUserData();

  const handleOpenChat = useCallback((data: UserMessage) => {
    userModel.setMsgList(data);
    // todo打开聊天窗口
  }, []);

  return (
    <section className='msg'>
      <MessageList itemKey='who' data={data} onItemClick={handleOpenChat} />
    </section>
  );
}

export default MessageView;
