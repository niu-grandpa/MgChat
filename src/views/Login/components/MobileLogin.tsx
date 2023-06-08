import femaleIcon from '@/assets/icons/female.svg';
import manIcon from '@/assets/icons/man.svg';
import Avatar from '@/components/Avatar';
import PhoneLoginInput from '@/components/PhoneLoginInput';
import PwdInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { getRegExp } from '@/utils';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LeftOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Carousel,
  Drawer,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import { eq } from 'lodash-es';
import { useCallback, useRef, useState } from 'react';
import Waitting from './Waitting';

type LoginWithPwd = {
  phoneNumber: string;
  code: string;
};

const { Title } = Typography;
const { useForm } = Form;
const { pwd } = getRegExp();

function MobileLogin() {
  const [loginForm] = useForm<LoginWithPwd>();
  const [registerForm] = useForm<{ password: string; double: string }>();

  const carousel = useRef<CarouselRef>(null);

  const [code, setCode] = useState<string>('');
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [current, setCurrent] = useState(0);
  const [gender, setGender] = useState(-1);
  const [nickname, setNickname] = useState('');

  const handleLoginWithToken = useCallback((token: string) => {
    // todo
  }, []);

  const handleLogin = useCallbackPlus((values: LoginWithPwd) => {
    // todo
  }, [])
    .before(values => {
      // 未查询到用户信息则要么注册要么不登录
      Modal.confirm({
        width: 280,
        content: '该手机号尚未注册账号，是否进行注册?',
        okText: 'Go',
        cancelText: '取消',
        onOk() {
          setOpen(true);
        },
      });
    })
    .after(() => {
      // token 存入本地
    });

  const handleRegNext = useCallbackPlus(() => {
    if (current < 2) {
      carousel.current?.next();
      return;
    }
    setLoading(true);
    // 注册成功返回token
  }, [gender, current, nickname, registerForm])
    .before(() => {
      if (eq(gender, -1)) {
        message.error('至少选择一个性别');
        return false;
      }
      if (eq(current, 1) && eq(nickname.length, 0)) {
        message.error('昵称是必填项');
        return false;
      }
      const { password, double } = registerForm.getFieldsValue();
      if (
        (eq(current, 2) && (!password || !pwd.test(password))) ||
        !eq(double, password)
      ) {
        message.error('请正确填写您的密码');
        return false;
      }
    })
    .after(() => {
      restData();
      setIsLogin(true);
      handleLoginWithToken('');
    });

  const restData = useCallback(() => {
    setOpen(false);
    setLoading(false);
    setCurrent(0);
    setGender(-1);
    setNickname('');
    loginForm.setFieldsValue({ phoneNumber: undefined, code: undefined });
    registerForm.setFieldsValue({ password: undefined, double: undefined });
  }, []);

  return (
    <>
      <Avatar size={58} className='login-avatar' />

      <Form form={loginForm} size='large' onFinish={handleLogin.invoke}>
        <PhoneLoginInput inputWidth={189} />
        <Form.Item>
          <Button size='middle' block type='primary' htmlType='submit'>
            登录
          </Button>
        </Form.Item>
      </Form>

      <Waitting open={isLogin} />

      <Drawer
        {...{ open }}
        width='100%'
        destroyOnClose
        className='mb-register-drawer'
        onClose={() => setOpen(false)}
        closeIcon={<LeftOutlined className='close-icon' />}>
        <Spin
          spinning={loading}
          tip='注册中...'
          indicator={<LoadingOutlined />}
          size='large'>
          <Carousel
            ref={carousel}
            dots={false}
            afterChange={setCurrent}
            effect='fade'>
            <div className='mb-register-content'>
              <Title level={4}>选择您的性别</Title>

              <Radio.Group
                size='large'
                value={gender}
                className='mb-register-gender'
                onChange={({ target }) => setGender(target.value)}>
                <Radio.Button value={0}>
                  <Space>
                    <img src={manIcon} width={16} height={16} /> 男
                  </Space>
                </Radio.Button>

                <Radio.Button value={1}>
                  <Space>
                    <img src={femaleIcon} width={16} height={16} /> 女
                  </Space>
                </Radio.Button>
              </Radio.Group>
            </div>

            <div className='mb-register-content'>
              <Title level={4}>您的昵称</Title>
              <Input
                bordered={false}
                placeholder='请输入...'
                className='mb-register-nickname'
                maxLength={12}
                onChange={({ target }) => setNickname(target.value)}
              />
            </div>

            <div className='mb-register-content'>
              <Title level={4}>设置您的密码</Title>
              <div className='mb-register-pwd'>
                <Form form={registerForm}>
                  <PwdInput
                    double
                    match
                    showTip
                    password={() => registerForm.getFieldValue('password')}
                  />
                </Form>
              </div>
            </div>
          </Carousel>

          <div className='mb-register-optbtn'>
            {current > 0 && (
              <Button
                icon={<ArrowLeftOutlined />}
                shape='circle'
                size='large'
                onClick={carousel.current?.prev}
              />
            )}
            <Button
              type='primary'
              shape='circle'
              size='large'
              icon={<ArrowRightOutlined />}
              onClick={handleRegNext.invoke}
            />
          </div>
        </Spin>
      </Drawer>
    </>
  );
}

export default MobileLogin;
