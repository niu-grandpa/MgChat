import NavBar from '@/components/NavBar';
import NetAlert from '@/components/NetAlert';
import { useLocalUsers, useOnline } from '@/hooks';
import { useUserStore } from '@/model';
import { apiHandler, userApi } from '@/services';
import { UserInfo } from '@/services/typing';
import { Layout, Tabs, TabsProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLogin from './components/MobileLogin';
import PasswordLogin from './components/PasswordLogin';
import Waitting from './components/Waitting';
import './index.scss';

export type SaveUserData = UserInfo & { auto: boolean; remember: boolean };
export type LoginCommonProps = {
  online: boolean | null;
  cancel?: boolean;
  onBeforeLogin: () => void;
  onLogin: (data: SaveUserData | 'failed') => void;
  onRegisterSuccess?: () => void;
};

export const cancelTime = 3000;
const { Header, Content } = Layout;
const tokenKey = 'lastToken';

function LoginView() {
  const navTo = useNavigate();
  const online = useOnline();
  const userStore = useUserStore();
  const localUsers = useLocalUsers();

  const [cancel, setCancel] = useState(false);
  const [wait, setWait] = useState(false);

  const onLogin = useCallback((data: SaveUserData | 'failed') => {
    if (data === 'failed') {
      setWait(false);
      return;
    }
    localUsers.set(data);
    userStore.setState(data);
    // 存储当前登录用户的token，下次自动登录使用
    data.auto && localStorage.setItem(tokenKey, data.token);
    navTo('/user', { state: { login: true, uid: data.uid } });
  }, []);

  const onAutoLogin = useCallback(() => {
    const lastToken = localStorage.getItem(tokenKey);
    if (!lastToken) return;
    setWait(true);
    const timer = setTimeout(async () => {
      const data = await apiHandler(() => userApi.loginWithToken(lastToken));
      if (data) {
        onLogin({ ...data, remember: true, auto: true });
      } else {
        setWait(false);
        clearTimeout(timer);
      }
    }, cancelTime);
    if (cancel) {
      setWait(false);
      clearTimeout(timer);
    }
  }, [onLogin]);

  useEffect(onAutoLogin, [onAutoLogin]);

  const props: LoginCommonProps = useMemo(
    () => ({
      online,
      cancel,
      onLogin,
      onBeforeLogin: () => setWait(true),
    }),
    [online, cancel, onLogin]
  );

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'password',
        label: `密码登录`,
        children: <PasswordLogin {...props} />,
      },
      {
        key: 'mobile',
        label: `手机号登录`,
        children: <MobileLogin {...props} onRegisterSuccess={onAutoLogin} />,
      },
    ],
    [props, onAutoLogin]
  );

  const handleCancel = useCallback(() => {
    setWait(false);
    setCancel(true);
    Promise.resolve().then(() => setCancel(false));
  }, []);

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
      <Waitting open={wait} onCancel={handleCancel} />
    </>
  );
}

export default LoginView;
