import { useCallbackPlus } from '@/hooks';
import { Layout } from 'antd';
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

  const handleSendMsg = useCallbackPlus((data: SendEventProps) => {
    console.log(data);
  }, [])
    .before((data: SendEventProps) => {
      if (!('content' in data)) data.content = '';
      if (!('images' in data)) data.images = [];
    })
    .after(() => {});

  return (
    <Layout className='chat'>
      <ChatHeader />
      <ChatDisplay />
      <ChatInput onSend={handleSendMsg.invoke} />
    </Layout>
  );
}

export default ChatView;
