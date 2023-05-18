import UAvatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import PwdFormInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { LoginData, UserLoginBaseInfo } from '@/services/typing';
import { getRegExp } from '@/utils';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  FormInstance,
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
  IconMinus,
  IconUser,
} from '@arco-design/web-react/icon';
import { ipcRenderer } from 'electron';
import { eq } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

type HistoryUsers = (UserLoginBaseInfo & LoginData)[];

const { useForm, useWatch } = Form;
const { Header, Content } = Layout;
const { Row, Col } = Grid;
const { pwd, phone } = getRegExp();

function LoginView() {
  const navigate = useNavigate();
  const [form] = useForm<LoginData>();
  const [arrow, setArrow] = useState(false);
  const [userIcon, setUserIcon] = useState('');
  const [historyUsers, setHistoryList] = useState<HistoryUsers>([]);

  const account = useWatch('account', form as FormInstance);
  useEffect(() => {
    if (eq(account, undefined)) return;
    if (!account.length) {
      form.setFieldsValue({ password: '' });
    }
    form.setFieldsValue({ account });
    const { icon } = findLocalUser(account);
    setUserIcon(icon);
  }, [account]);

  const findLocalUser = useCallback((key: string) => {
    const [info] = historyUsers.filter(({ account }) => account === key);
    return info || {};
  }, []);

  const handleUseHistory = useCallbackPlus(
    (key: string) => {
      const { icon, online, nickname, ...rest } = findLocalUser(key);
      setUserIcon(icon);
      setArrow(v => !!v);
      form.setFieldsValue(rest);
    },
    [form]
  ).before((key: string) => {
    setArrow(v => !v);
    const { online, account } = findLocalUser(key);
    if (online) {
      Message.warning(`您已登录 ${account}，不能重复登录`);
      return false;
    }
  });

  const handleLogin = useCallbackPlus((values: LoginData) => {
    console.log(values);
  }, [])
    .before(() => {
      const { account, password } = form.getFieldsValue();
      if (eq(account!.length, 11) && phone.test(account!)) {
        Message.error('请输入正确的手机号码');
        return false;
      }
      if (!pwd.test(password!)) {
        Message.error('无效的密码');
        return false;
      }
    })
    .after(res => {
      // 这里使用路由跳转而不是打开新窗口
      // 因为登录界面和登录后的用户界面都是主窗口，只要关闭就等于结束整个进程
      // 因此只需要渲染路由界面和调整窗口大小位置即可
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
              onClick: () =>
                ipcRenderer.invoke('close-win', { pathname: 'main' }),
            },
          ]}
        />
        <UAvatar icon={userIcon} size={62} className='login-avatar' />
      </Header>
      <Content className='login-content'>
        <Form
          form={form}
          className='login-form'
          autoComplete='off'
          validateTrigger='onSubmit'
          onSubmit={handleLogin.invoke}>
          <Dropdown
            trigger='click'
            popupVisible={arrow}
            droplist={
              <Menu
                style={{ width: 269 }}
                onClickMenuItem={handleUseHistory.invoke}>
                {historyUsers?.map(({ nickname, account, icon }) => (
                  <Menu.Item key={account} className='dropdown-menu-item'>
                    <Row align='center'>
                      <Col flex='50px'>
                        <UAvatar size={32} {...{ icon }} />
                      </Col>
                      <Col flex='auto'>
                        <p>{nickname}</p>
                        <span style={{ color: '#a0a0a0' }}>{account}</span>
                      </Col>
                    </Row>
                  </Menu.Item>
                ))}
              </Menu>
            }>
            <Form.Item
              field='account'
              rules={[
                {
                  required: true,
                  minLength: 9,
                  maxLength: 11,
                  message: '请填写9-11位的账号',
                },
              ]}>
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
              />
            </Form.Item>
          </Dropdown>
          <PwdFormInput field='password' />
          <Form.Item>
            <Space size='large'>
              <Form.Item field='auto' triggerPropName='checked'>
                <Checkbox>自动登录</Checkbox>
              </Form.Item>
              <Form.Item field='remember' triggerPropName='checked'>
                <Checkbox>记住密码</Checkbox>
              </Form.Item>
              <Form.Item>
                <a>找回密码</a>
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item style={{ marginTop: 6 }}>
            <Button
              size='default'
              htmlType='submit'
              shape='round'
              long
              type='primary'>
              登录
            </Button>
          </Form.Item>
          <a
            className='login-register'
            onClick={() => {
              ipcRenderer.invoke('open-win', {
                pathname: 'register',
                title: 'MgChat注册',
              });
            }}>
            注册帐号
          </a>
        </Form>
      </Content>
    </Layout>
  );
}

export default LoginView;
