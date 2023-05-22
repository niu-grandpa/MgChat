import UAvatar from '@/components/Avatar';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ContentDisplay from './ContentDisplay';
import ContentHeader from './ContentHeader';
import InputContent from './InputContent';
import './index.scss';

const { Header, Content, Sider, Footer } = Layout;

function UserPanel() {
  const { state } = useLocation() as { state: { account: string } };

  const changeWinShape = useCallback(() => {
    ipcRenderer.send('resize-win', {
      pathname: 'main',
      width: 875,
      height: 620,
      resizable: true,
    });
    ipcRenderer.send('set-position', {
      pathname: 'main',
      center: true,
    });
  }, []);

  useEffect(() => {
    changeWinShape();
  }, [state]);

  return (
    <Layout className='main'>
      <Sider width={62} theme='light' className='sider-first'>
        <UAvatar size='large' />
      </Sider>
      <Layout>
        <Sider width={230} className='sider-second'></Sider>
        <Layout className='content'>
          <Header className='content-header'>
            <ContentHeader />
          </Header>
          <Content className='content-display'>
            <ContentDisplay />
          </Content>
          <Footer className='content-footer'>
            <InputContent />
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default UserPanel;
