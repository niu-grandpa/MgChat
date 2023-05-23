import MenuBar from '@/components/MenuBar/MenuBar';
import { Layout } from 'antd';
import { useEffect } from 'react';

function ChatHeader() {
  useEffect(() => {}, []);

  return (
    <Layout.Header className='chat-header'>
      <a className='nickname'>网点文档</a>
      <MenuBar />
    </Layout.Header>
  );
}

export default ChatHeader;
