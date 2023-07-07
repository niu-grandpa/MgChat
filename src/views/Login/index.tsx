import NavBar from '@/components/NavBar';
import NetAlert from '@/components/NetAlert';
import { useLocalUsers, useOnline } from '@/hooks';
import { useUserStore } from '@/model';
import { apiHandler, userApi } from '@/services';
import { UserInfo } from '@/services/typing';
import { Layout, Tabs, TabsProps } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  const timer = useRef<NodeJS.Timeout>();

  const lastToken = useMemo(() => localStorage.getItem(tokenKey), []);

  const [wait, setWait] = useState(false);
  const [auto, setAuto] = useState(lastToken !== undefined);
  const [cancel, setCancel] = useState<boolean | undefined>(undefined);

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

  const onLoginWithToken = useCallback(async () => {
    if (!lastToken) return;
    const data = await apiHandler(() => userApi.loginWithToken(lastToken));
    if (data) {
      onLogin({ ...data, remember: true, auto: true });
    } else {
      setWait(false);
      setAuto(false);
    }
  }, [onLogin, lastToken]);

  const handleAutoLogin = useCallback(() => {
    setWait(true);
    timer.current = setTimeout(onLoginWithToken, cancelTime);
  }, []);

  let tryCount = 0;
  useEffect(() => {
    tryCount++;
    if (tryCount !== 2 && auto) handleAutoLogin();
  }, [auto]);

  useEffect(() => {
    if (auto && cancel && timer.current) {
      setWait(false);
      setAuto(false);
      setCancel(undefined);
      clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, [auto, cancel, timer.current]);

  const props: LoginCommonProps = useMemo(
    () => ({
      online,
      cancel,
      onLogin,
      onBeforeLogin: () => {
        setWait(true);
        setCancel(false);
      },
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
        children: (
          <MobileLogin {...props} onRegisterSuccess={onLoginWithToken} />
        ),
      },
    ],
    [props, onLoginWithToken]
  );

  const handleCancel = useCallback(() => {
    setWait(false);
    setCancel(true);
    Promise.resolve().then(() => setCancel(undefined));
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
      <Waitting open={wait} destroyOnClose onCancel={handleCancel} />
    </>
  );
}

export default LoginView;
