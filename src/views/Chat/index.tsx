import ActionBar from '@/components/ActionBar';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const { Header, Content, Footer } = Layout;

function ChatView() {
  const { friend } = useParams();

  const pathname = useMemo(() => `/chat/${friend}`, [friend]);

  useEffect(() => {
    ipcRenderer.send('resize-win', {
      width: 550,
      height: 480,
      pathname,
    });
  }, []);

  return (
    <Layout>
      <Header className='chat-header'>
        <span style={{ cursor: 'pointer' }}>管理员</span>
        <ActionBar keepAliveWhenClosed offset={[-6, 0]} pathname={pathname} />
      </Header>
      <Content className='chat-content'>2</Content>
      <Footer className='chat-footer'>3</Footer>
    </Layout>
  );
}

export default ChatView;
