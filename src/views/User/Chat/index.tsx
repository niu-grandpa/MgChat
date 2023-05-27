import { useCallbackPlus } from '@/hooks';
import { MessageData, MessageRoles } from '@/services/typing';
import { Layout } from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatDisplay from './ChatDisplay';
import ChatHeader from './ChatHeader';
import ChatInput, { SendEventProps } from './ChatInput';
import './index.scss';

function ChatView() {
  // 1.打开聊天窗口获取消息历史记录。get: []
  // 2.发送消息给对方。send: { uid: 1, receiver: 2, content: '123', image: [] }
  // 3.接收目标消息。receive: { fromId: 1, content: '123', image: [] }
  // 4.接收成功后保存消息到云端。save: {uid: [{},...], ...}
  // 5.上一步需开通大贵族才能使用，否则保存在本地。

  const [search] = useSearchParams();

  const [message, setMessage] = useState<MessageData | undefined>();

  const onReceiveMessage = useCallbackPlus(() => {
    // 实时接收对方消息
    setMessage({
      role: 0,
      content: 'string',
      images: [],
      timestamp: 0,
    });
  }, []);

  const handleSendMsg = useCallbackPlus<SendEventProps>(
    (data: SendEventProps) => {
      // todo post请求 待到对方接收成功之后，此条消息再加入到聊天列表
      return data;
    },
    []
  ).after(data =>
    setMessage(v => {
      const obj = { ...data, role: MessageRoles.ME };
      if (!v) return obj;
      return { ...v, ...obj };
    })
  );

  useEffect(() => {
    onReceiveMessage.invoke();
  }, []);

  return (
    <Layout className='chat'>
      <ChatHeader />
      <ChatDisplay message={message} />
      <ChatInput onSend={handleSendMsg.invoke} />
    </Layout>
  );
}

export default ChatView;
