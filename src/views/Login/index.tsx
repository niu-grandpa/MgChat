import DefaultAvatar from '@/assets/icons/avatar.png';
import NavBar from '@/components/NavBar';
import { useCallbackPlus } from '@/hooks';
import {
  Avatar,
  Button,
  Checkbox,
  Form,
  Input,
  Layout,
  Space,
} from '@arco-design/web-react';
import {
  IconClose,
  IconLock,
  IconMinus,
  IconUser,
} from '@arco-design/web-react/icon';
import { ipcRenderer } from 'electron';
import { useNavigate } from 'react-router-dom';
import './index.scss';

type FormData = {
  username: number;
  password: number;
  auto: boolean;
  remember: boolean;
};

const { useForm } = Form;
const { Header, Content } = Layout;

function LoginView() {
  const navigate = useNavigate();
  const [form] = useForm<FormData>();

  const handleLogin = useCallbackPlus((values: FormData) => {
    console.log(values);
  }, []).after(res => {
    navigate('/user', { replace: true, state: { userId: 0 } });
  });

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
        <Avatar size={64} className='login-avatar'>
          <img src={DefaultAvatar} style={{ objectFit: 'cover' }} />
        </Avatar>
      </Header>
      <Content className='login-content'>
        <Form<FormData>
          form={form}
          size='large'
          className='login-form'
          autoComplete='off'
          validateTrigger='onSubmit'
          onSubmit={handleLogin.invoke}>
          <Form.Item
            field='username'
            rules={[
              {
                required: true,
                minLength: 9,
                maxLength: 11,
                message: '请输入正确的账号',
              },
            ]}>
            <Input
              allowClear
              type='number'
              prefix={<IconUser />}
              placeholder='MG号码/手机'
            />
          </Form.Item>
          <Form.Item
            field='password'
            rules={[
              {
                required: true,
                minLength: 9,
                maxLength: 11,
                message: '请输入有效的密码',
              },
            ]}>
            <Input
              allowClear
              minLength={6}
              type='password'
              placeholder='密码'
              prefix={<IconLock />}
            />
          </Form.Item>
          <Form.Item>
            <Space size='large'>
              <Form.Item field='auto' style={{ marginBottom: 0 }}>
                <Checkbox>自动登录</Checkbox>
              </Form.Item>
              <Form.Item field='remember' style={{ marginBottom: 0 }}>
                <Checkbox>记住密码</Checkbox>
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <a>找回密码</a>
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button htmlType='submit' shape='round' long type='primary'>
              登录
            </Button>
          </Form.Item>
          <a className='login-register'>注册帐号</a>
        </Form>
      </Content>
    </Layout>
  );
}

export default LoginView;
