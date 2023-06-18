import NavBar from '@/components/NavBar';
import NetAlert from '@/components/NetAlert';
import { useSleep as sleep, useLocalUsers } from '@/hooks';
import { useUserData } from '@/model';
import { UserInfo } from '@/services/typing';
import { Layout, Tabs, TabsProps } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLogin from './components/MobileLogin';
import PasswordLogin from './components/PasswordLogin';
import './index.scss';

export type SaveData = UserInfo & { auto: boolean; remember: boolean };

const { Header, Content } = Layout;

function LoginView() {
  const localUser = useLocalUsers();
  const userModel = useUserData();
  const navTo = useNavigate();

  const handleSaveData = useCallback(
    (data: SaveData) => {
      userModel.save(data);
      localUser.set(data);
      localStorage.setItem('token', data.token);
    },
    [localUser, userModel]
  );

  const handleLoginSuccess = useCallback(
    (data: SaveData) => {
      handleSaveData(data);
      // 使用路由跳转而不是打开新窗口，
      // 因为登录界面和登录后的用户界面都是主窗口，只要关闭就等于结束整个进程，
      // 因此只需要渲染路由界面和调整窗口大小位置即可。
      sleep(2000).then(() => navTo('/user', { state: { login: true } }));
    },
    [handleSaveData]
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'password',
      label: `密码登录`,
      children: <PasswordLogin onSuccess={handleLoginSuccess} />,
    },
    {
      key: 'mobile',
      label: `手机号登录`,
      children: <MobileLogin onSuccess={handleLoginSuccess} />,
    },
  ];

  return (
    <>
      <NetAlert rootClassName='login-banner' />
      <Layout className='login'>
        <Header className='login-header'>
          <NavBar />
        </Header>
        <Content className='login-content'>
          <Tabs
            size='small'
            animated
            centered
            items={tabItems}
            defaultActiveKey='password'
          />
        </Content>
      </Layout>
    </>
  );
}

export default LoginView;
