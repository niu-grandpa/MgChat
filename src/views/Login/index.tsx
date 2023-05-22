import UAvatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import PwdFormInput from '@/components/PwdInput';
import { useSleep as sleep, useCallbackPlus, useOnline } from '@/hooks';
import { LoginData, LoginResponse } from '@/services/typing';
import { getRegExp } from '@/utils';
import {
  DownOutlined,
  Loading3QuartersOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Dropdown,
  Form,
  FormInstance,
  Input,
  Layout,
  MenuProps,
  Row,
  Space,
  Spin,
  message,
} from 'antd';
import { ipcRenderer } from 'electron';
import { eq, gt, uniqBy } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

export type HistoryUsers = LoginResponse & LoginData;

const { useForm, useWatch } = Form;
const { Header, Content } = Layout;
const { pwd, phone } = getRegExp();

function LoginView() {
  const navigate = useNavigate();
  const isOnline = useOnline();
  const [form] = useForm<LoginData>();
  const [arrow, setArrow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [userIcon, setUserIcon] = useState('');
  const [historyUsers, setHistoryList] = useState<HistoryUsers[]>([
    {
      account: '15302541396',
      password: 'zrh.1999',
      auto: true,
      remember: true,
      online: false,
      nickname: '草泥',
      icon: '',
    },
  ]);

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
      message.warning(`您已登录 ${account}，不能重复登录`);
      return false;
    }
  });

  const handleLogin = useCallbackPlus<HistoryUsers>(
    async (values: LoginData) => {
      console.log(values);
      await sleep(1000);
      // todo
      return {
        nickname: '王五',
        online: true,
        icon: '',
        ...values,
      };
    },
    []
  )
    .before(() => {
      const { account, password } = form.getFieldsValue();
      if (!account || !/^\w{9,11}$/.test(account)) {
        message.error('请输入9~11位的账号');
        return false;
      }
      if (
        account[0] === '1' &&
        gt(account.length, 9) &&
        !phone.test(account!)
      ) {
        message.error('请输入正确的手机号码');
        return false;
      }
      if (!password) {
        message.error('请输入您的密码');
        return false;
      }
      if (!pwd.test(password!)) {
        message.error('密码格式有误');
        return false;
      }
      setSpinning(v => !v);
    })
    .after(data => {
      setSpinning(v => !v);
      setHistoryList(v => uniqBy([data, ...v], 'account'));
      // 这里使用路由跳转而不是打开新窗口
      // 因为登录界面和登录后的用户界面都是主窗口，只要关闭就等于结束整个进程
      // 因此只需要渲染路由界面和调整窗口大小位置即可
      navigate('/user', { replace: true, state: { account: data.account } });
    });

  const handleForget = useCallback(() => {
    const account = form.getFieldValue('account');
    ipcRenderer.send('open-win', {
      pathname: 'forget',
      title: '找回密码',
      search: !account ? '' : `?account=${account}`,
    });
  }, []);

  const userItems: MenuProps['items'] = historyUsers.map(
    ({ nickname, account, icon }) => ({
      key: account,
      label: (
        <Row align='middle' key={account}>
          <Col flex='50px'>
            <UAvatar size={38} {...{ icon }} />
          </Col>
          <Col flex='auto'>
            <div>{nickname}</div>
            <span style={{ color: '#a0a0a0' }}>{account}</span>
          </Col>
        </Row>
      ),
      onClick: () => handleUseHistory.invoke(account),
    })
  );

  return (
    <>
      {!isOnline && (
        <Alert
          banner
          closable
          rootClassName='login-banner'
          message='当前网络未连接，请检查网络后重试'
        />
      )}
      <Spin
        {...{ spinning }}
        size='large'
        tip='登录中...'
        indicator={<Loading3QuartersOutlined spin />}>
        <Layout className='login'>
          <Header className='login-header'>
            <NavBar />
            <UAvatar icon={userIcon} size={64} className='login-avatar' />
          </Header>
          <Content className='login-content'>
            <Form<LoginData>
              form={form}
              className='login-form'
              autoComplete='off'
              onFinish={handleLogin.invoke}>
              <Dropdown
                open={arrow}
                trigger={['click']}
                overlayStyle={{
                  maxHeight: 138,
                  overflowY: 'auto',
                  boxShadow: '0 0 2px 2px #F2F3F5',
                }}
                menu={{ items: userItems }}>
                <Form.Item name='account'>
                  <Input
                    type='number'
                    prefix={<UserOutlined />}
                    suffix={
                      <DownOutlined
                        onClick={() => setArrow(v => !v)}
                        style={{
                          cursor: 'pointer',
                          rotate: `${arrow ? 180 : 0}deg`,
                        }}
                      />
                    }
                    placeholder='MG号码/手机'
                  />
                </Form.Item>
              </Dropdown>
              <PwdFormInput name='password' />
              <Form.Item style={{ marginBottom: 0 }}>
                <Space size='large'>
                  <Form.Item name='auto' valuePropName='checked'>
                    <Checkbox>自动登录</Checkbox>
                  </Form.Item>
                  <Form.Item name='remember' valuePropName='checked'>
                    <Checkbox>记住密码</Checkbox>
                  </Form.Item>
                  <Form.Item>
                    <a onClick={handleForget}>找回密码</a>
                  </Form.Item>
                </Space>
              </Form.Item>
              <Form.Item className='login-form-btn'>
                <Button htmlType='submit' block type='primary'>
                  登录
                </Button>
              </Form.Item>
              <a
                className='login-register'
                onClick={() => {
                  ipcRenderer.send('open-win', {
                    pathname: 'register',
                    title: 'MgChat注册',
                  });
                }}>
                注册帐号
              </a>
            </Form>
          </Content>
        </Layout>
      </Spin>
    </>
  );
}

export default LoginView;
