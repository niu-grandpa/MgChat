import NavBar from '@/components/NavBar';
import { Avatar, Layout } from '@arco-design/web-react';
import { IconClose, IconMinus } from '@arco-design/web-react/icon';
import { ipcRenderer } from 'electron';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const { Header, Content } = Layout;

function LoginView() {
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    navigate('/user', { replace: true, state: { userId: 0 } });
  }, []);

  return (
    <Layout className='login'>
      <Header className='login-header'>
        <NavBar
          items={[
            {
              title: '最小化',
              icon: <IconMinus />,
              onClick: () => ipcRenderer.invoke('min-win', 'main'),
            },
            {
              title: '关闭',
              icon: <IconClose />,
              danger: true,
              onClick: () => ipcRenderer.invoke('close-win', { path: 'main' }),
            },
          ]}
        />
        <Avatar size={62} className='login-avatar'>
          <img
            alt='avatar'
            src='https://dthezntil550i.cloudfront.net/p4/latest/p42102052243097410008650553/1280_960/12bc8bc0-2186-48fb-b432-6c011a559ec0.png'
          />
        </Avatar>
      </Header>
      <Content></Content>
    </Layout>
  );
}

export default LoginView;
