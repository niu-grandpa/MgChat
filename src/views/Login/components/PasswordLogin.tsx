import Avatar from '@/components/Avatar';
import PwdFormInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { LoginData } from '@/services/typing';
import { getRegExp } from '@/utils';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Row,
  Space,
  message,
} from 'antd';
import { FormInstance } from 'antd/es/form';
import { ipcRenderer } from 'electron';
import { eq, uniqBy } from 'lodash-es';
import { memo, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type LoginWithPwd = {
  uid: string;
  password: string;
};

type HistoryUsersType = {
  uid: string;
  password: string;
  auto: boolean;
  remember: boolean;
  nickname: string;
  icon: string;
};

const { phone } = getRegExp();
const { useForm, useWatch } = Form;

function PasswordLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = useForm<HistoryUsersType>();

  const [arrow, setArrow] = useState(false);
  const [userIcon, setUserIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyUsers, setHistoryList] = useState<HistoryUsersType[]>([
    {
      uid: '15302541396',
      password: 'zrh.1999',
      auto: true,
      remember: true,
      nickname: '草泥',
      icon: '',
    },
  ]);

  const uid = useWatch('uid', form as FormInstance);
  useEffect(() => {
    if (eq(uid, undefined)) return;
    if (!uid.length) {
      form.setFieldsValue({ password: '', auto: false, remember: false });
    }
    form.setFieldsValue({ uid });
    const { icon } = findLocalUser(uid);
    setUserIcon(icon);
  }, [uid]);

  const findLocalUser = useCallback((key: string) => {
    const [info] = historyUsers.filter(({ uid }) => uid === key);
    return info || {};
  }, []);

  const handleUseHistory = useCallback(
    (key: string) => {
      const { icon, nickname, ...rest } = findLocalUser(key);
      setUserIcon(icon);
      setArrow(v => !v);
      form.setFieldsValue(rest);
    },
    [form]
  );

  const handleLogin = useCallbackPlus<HistoryUsersType>(
    async (values: LoginData) => {
      // todo 去掉不必要字段、jwt加密
      return values;
    },
    []
  )
    .before(() => {
      const { uid, password } = form.getFieldsValue();
      setLoading(true);
      if (!uid || uid.length < 9) {
        message.error('请输入正确的账号');
        return false;
      }
      if (!password) {
        message.error('请输入您的密码');
        return false;
      }
      setLoading(false);
    })
    .after(data => {
      setLoading(false);
      setHistoryList(v => uniqBy([data, ...v], 'uid'));
      // 这里使用路由跳转而不是打开新窗口
      // 因为登录界面和登录后的用户界面都是主窗口，只要关闭就等于结束整个进程
      // 因此只需要渲染路由界面和调整窗口大小位置即可
      // navigate('/user', { replace: true, state: { uid: data.uid } });
      // location.pathname = 'user';
    });

  const handleForget = useCallback(() => {
    const uid = form.getFieldValue('uid');
    ipcRenderer.send('open-win', {
      key: 'forget',
      title: '找回密码',
      search: !uid ? '' : `?uid=${uid}`,
    });
  }, []);

  const userItems: MenuProps['items'] = historyUsers.map(
    ({ nickname, uid, icon }) => ({
      key: uid,
      label: (
        <Row align='middle' key={uid}>
          <Col flex='50px'>
            <Avatar size={38} {...{ icon }} />
          </Col>
          <Col flex='auto'>
            <div>{nickname}</div>
            <span style={{ color: '#a0a0a0' }}>{uid}</span>
          </Col>
        </Row>
      ),
      onClick: () => handleUseHistory(uid),
    })
  );

  return (
    <>
      {loading && <div className='login-waiting' />}
      <Form
        form={form}
        className='pwd-login'
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
          <Form.Item name='uid'>
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
              placeholder='MG号码'
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
        <Form.Item className='pwd-login-btn'>
          <Button {...{ loading }} htmlType='submit' block type='primary'>
            登录
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default memo(PasswordLogin);
