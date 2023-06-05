import UAvatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import NetAlert from '@/components/NetAlert';
import { Layout, Tabs, TabsProps } from 'antd';
import MobileLogin from './components/MobileLogin';
import PasswordLogin from './components/PasswordLogin';
import './index.scss';

const { Header, Content } = Layout;

function LoginView() {
  const tabItems: TabsProps['items'] = [
    {
      key: 'password',
      label: `密码登录`,
      children: <PasswordLogin />,
    },
    {
      key: 'mobile',
      label: `手机号登录`,
      children: <MobileLogin />,
    },
  ];

  return (
    <>
      <NetAlert rootClassName='login-banner' />
      <Layout className='login'>
        <Header className='login-header'>
          <NavBar />
          <UAvatar icon={''} size={60} className='login-avatar' />
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
