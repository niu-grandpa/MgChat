import NavBar from '@/components/NavBar';
import NetAlert from '@/components/NetAlert';
import { useLocalUsers } from '@/hooks';
import { UserInfo } from '@/services/typing';
import { Layout, Tabs, TabsProps } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLogin from './components/MobileLogin';
import PasswordLogin from './components/PasswordLogin';
import './index.scss';

const { Header, Content } = Layout;

function LoginView() {
  const localUser = useLocalUsers();
  const navTo = useNavigate();

  const handleSaveData = useCallback(
    (data: UserInfo) => {
      const { uid, token, icon, nickname, password } = data;
      localStorage.setItem('token', token);
      // 用户数据通过sessionStorage临时存储起来，方便页面间传递
      sessionStorage.setItem('temporary', JSON.stringify(data));
      localUser.set({
        uid,
        icon,
        nickname,
        password,
        auto: true,
        remember: true,
      });
    },
    [localUser]
  );

  const handleLoginSuccess = useCallback(
    (data: UserInfo) => {
      handleSaveData(data);
      navTo('/user', { state: { login: true } });
    },
    [handleSaveData]
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'password',
      label: `密码登录`,
      children: <PasswordLogin />,
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
