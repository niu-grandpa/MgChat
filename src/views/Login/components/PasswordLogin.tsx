import Avatar from '@/components/Avatar';
import PwdFormInput from '@/components/PwdInput';
import { useCallbackPlus, useLocalUsers } from '@/hooks';
import { type LocalUsersType } from '@/hooks/useLocalUsers';
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
import { eq } from 'lodash-es';
import { memo, useCallback, useEffect, useState } from 'react';

import { apiHandler, userApi } from '@/services';
import { UserInfo } from '@/services/typing';
import { SaveData } from '..';
import Waitting from './Waitting';

type LoginWithPwd = {
  uid: string;
  password: string;
};

const { useForm, useWatch } = Form;

function PasswordLogin({ onSuccess }: { onSuccess: (data: SaveData) => void }) {
  const localUsers = useLocalUsers();
  const [form] = useForm<LocalUsersType>();

  const [arrow, setArrow] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [logging, setLogging] = useState(false);

  const uid: string = useWatch('uid', form as FormInstance);
  useEffect(() => {
    if (eq(uid, undefined)) return;
    if (!uid.length) {
      form.setFieldsValue({ password: '', auto: false, remember: false });
    }
    if (uid.length === 10) {
      const user = localUsers.get(uid);
      user && setAvatar(user.icon);
    }
  }, [uid, form]);

  const handleGetLocalUser = useCallback(
    (uid: string) => {
      const { icon, nickname, ...rest } = localUsers.get(uid);
      setAvatar(icon);
      setArrow(v => !v);
      form.setFieldsValue(rest);
    },
    [form, localUsers]
  );

  const handleLogin = useCallbackPlus<UserInfo>(
    async (values: LoginWithPwd) => {
      const { uid, password } = values;
      const res = await apiHandler(() =>
        userApi.loginWithPwd({ uid, password })
      );
      if (!res) setLogging(false);
      return res;
    },
    []
  )
    .before(() => {
      // 检查账号密码
      const { uid, password } = form.getFieldsValue();
      if (!uid || uid.length < 9) {
        message.error('请输入正确的账号');
        return false;
      }
      if (!password) {
        message.error('请输入您的密码');
        return false;
      }
      setLogging(true);
    })
    .after(data => onSuccess({ ...data, ...form.getFieldsValue() }));

  const handleForget = useCallback(() => {
    const uid = form.getFieldValue('uid');
    ipcRenderer.send('open-win', {
      key: 'forget',
      title: '找回密码',
      search: !uid ? '' : `?uid=${uid}`,
    });
  }, []);

  const userItems: MenuProps['items'] = localUsers
    .list()
    .map(({ nickname, uid, icon }) => ({
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
      onClick: () => handleGetLocalUser(uid),
    }));

  return (
    <>
      <Waitting open={logging} />
      <Avatar icon={avatar} size={56} className='login-avatar' />
      <Form
        form={form}
        className='pwd-login'
        autoComplete='off'
        onFinish={handleLogin.invoke}
        onValuesChange={({ auto }) =>
          auto && form.setFieldValue('remember', auto)
        }>
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
        <Form.Item style={{ marginBottom: 0, height: 36 }}>
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
          <Button htmlType='submit' block type='primary'>
            登录
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default memo(PasswordLogin);
