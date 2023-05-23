import UAvatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import {
  LogoutOutlined,
  MessageOutlined,
  PlusOutlined,
  UserOutlined,
  UsergroupDeleteOutlined,
} from '@ant-design/icons';
import { Badge, Button, Layout, Space } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './index.scss';

const { Sider } = Layout;

function UserPanel() {
  const { state } = useLocation() as { state: { account: string } };

  const changeWinShape = useCallback(() => {
    ipcRenderer.send('resize-win', {
      pathname: 'main',
      width: 300,
      height: 660,
      resizable: true,
    });
    ipcRenderer.send('set-position', {
      pathname: 'main',
      marginRight: 320,
      y: 60,
    });
  }, []);

  useEffect(() => {
    changeWinShape();
  }, [state]);

  return (
    <Layout className='user'>
      <Sider width={251} className='user-main'>
        <div className='user-main-nav'>
          <NavBar />
        </div>
      </Sider>
      <Sider width={52} className='user-siderbar'>
        <div>
          <UAvatar
            size='large'
            onClick={() => {
              ipcRenderer.send('open-win', {
                pathname: 'chat',
                title: '聊天',
                frame: false,
                alive: true,
                width: 580,
                height: 520,
              });
            }}
          />
          <Badge status='success' className='user-siderbar-status' />
        </div>
        <Space wrap className='user-siderbar-space'>
          <Badge count={0} dot offset={[-10, 10]}>
            <Button type='text' size='large' icon={<MessageOutlined />} />
          </Badge>
          <Badge count={0} dot offset={[-10, 10]}>
            <Button type='text' size='large' icon={<UserOutlined />} />
          </Badge>
          <Badge count={0} dot offset={[-10, 10]}>
            <Button
              type='text'
              size='large'
              icon={<UsergroupDeleteOutlined />}
            />
          </Badge>
          <Button type='text' size='large' icon={<PlusOutlined />} />
          <Button
            type='text'
            size='large'
            icon={<LogoutOutlined />}
            className='logout'
          />
        </Space>
      </Sider>
    </Layout>
  );
}

export default UserPanel;
