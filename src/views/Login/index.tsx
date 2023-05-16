import defaultAvatar from '@/assets/icons/avatar.png';
import UAvatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import { useCallbackPlus } from '@/hooks';
import { LoginData, UserLoginBaseInfo } from '@/services/typing';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Grid,
  Input,
  Layout,
  Menu,
  Message,
  Space,
} from '@arco-design/web-react';
import {
  IconClose,
  IconDown,
  IconLock,
  IconMinus,
  IconUser,
} from '@arco-design/web-react/icon';
import { ipcRenderer } from 'electron';
import { debounce } from 'lodash-es';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

type HistoryUsers = (UserLoginBaseInfo & LoginData)[];

const { useForm } = Form;
const { Header, Content } = Layout;
const { Row, Col } = Grid;

function LoginView() {
  const navigate = useNavigate();
  const [form] = useForm<LoginData>();

  const [arrow, setArrow] = useState(false);
  const [userIcon, setUserIcon] = useState(defaultAvatar);
  const [historyUsers, setHistoryList] = useState<HistoryUsers>([
    {
      username: '和乐团',
      account: '2864113064',
      icon: '',
      online: false,
      password: '123456798',
      auto: true,
      remember: true,
    },
  ]);

  const findLocalUser = useCallback((key: string) => {
    const [info] = historyUsers.filter(({ account }) => account === key);
    return info;
  }, []);

  const handleInputAccount = debounce((account: string) => {
    form.setFieldsValue({ account });
    const { icon } = findLocalUser(account);
    setUserIcon(icon || defaultAvatar);
  }, 200);

  const handleSetHistoryUser = useCallbackPlus((key: string) => {
    const { auto, account, password, remember, icon } = findLocalUser(key);
    setUserIcon(icon);
    setArrow(v => !!v);
    form.setFieldsValue({
      auto,
      account,
      password,
      remember,
    });
  }, []).before((key: string) => {
    setArrow(v => !v);
    const { online, account } = findLocalUser(key);
    if (online) {
      Message.warning(`您已登录 ${account}，不能重复登录`);
      return false;
    }
  });

  const handleLogin = useCallbackPlus((values: LoginData) => {
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
        <UAvatar icon={userIcon} size={68} className='login-avatar' />
      </Header>
      <Content className='login-content'>
        <Form<LoginData>
          form={form}
          size='large'
          className='login-form'
          autoComplete='off'
          validateTrigger='onSubmit'
          onSubmit={handleLogin.invoke}>
          <Form.Item
            field='account'
            rules={[
              {
                required: true,
                minLength: 9,
                maxLength: 11,
                message: '请输入正确的账号',
              },
            ]}>
            <Dropdown
              trigger='click'
              popupVisible={arrow}
              droplist={
                <Menu
                  style={{ width: 269 }}
                  onClickMenuItem={handleSetHistoryUser.invoke}>
                  {historyUsers?.map(({ username, account, icon }) => (
                    <Menu.Item key={account} className='dropdown-menu-item'>
                      <Row align='center'>
                        <Col flex='50px'>
                          <UAvatar size={32} {...{ icon }} />
                        </Col>
                        <Col flex='auto'>
                          <p>{username}</p>
                          <span style={{ color: '#a0a0a0' }}>{account}</span>
                        </Col>
                      </Row>
                    </Menu.Item>
                  ))}
                </Menu>
              }>
              <Input
                type='number'
                prefix={<IconUser />}
                suffix={
                  <IconDown
                    onClick={() => setArrow(v => !v)}
                    style={{
                      rotate: `${arrow ? 180 : 0}deg`,
                      cursor: 'pointer',
                    }}
                  />
                }
                placeholder='MG号码/手机'
                onChange={handleInputAccount}
              />
            </Dropdown>
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
              minLength={6}
              type='password'
              placeholder='密码'
              prefix={<IconLock />}
            />
          </Form.Item>
          <Form.Item>
            <Space size='large'>
              <Form.Item
                field='auto'
                triggerPropName='checked'
                style={{ marginBottom: 0 }}>
                <Checkbox>自动登录</Checkbox>
              </Form.Item>
              <Form.Item
                field='remember'
                triggerPropName='checked'
                style={{ marginBottom: 0 }}>
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
