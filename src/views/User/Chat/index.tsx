import { Layout } from 'antd';
import ChatDisplay from './ChatDisplay';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import './index.scss';

function ChatView() {
  return (
    <Layout className='chat'>
      <ChatHeader />
      <ChatDisplay />
      <ChatInput />
    </Layout>
  );
}

export default ChatView;
