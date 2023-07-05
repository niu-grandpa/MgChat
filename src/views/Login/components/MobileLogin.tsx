import femaleIcon from '@/assets/icons/female.svg';
import manIcon from '@/assets/icons/man.svg';
import Avatar from '@/components/Avatar';
import PhoneLoginInput from '@/components/PhoneLoginInput';
import PwdInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { apiHandler, userApi } from '@/services';
import { UserInfo } from '@/services/typing';
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
  Radio,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import { eq } from 'lodash-es';
import { memo, useCallback, useRef, useState } from 'react';
import { LoginCommonProps, cancelTime } from '..';

type LoginWithPhone = {
  phoneNumber: string;
  code: string;
};

const { Title } = Typography;
const { useForm } = Form;
const { pwd } = getRegExp();

function MobileLogin({
  online,
  cancel,
  onLogin,
  onBeforeLogin,
  onRegisterSuccess,
}: LoginCommonProps) {
  const [loginForm] = useForm<LoginWithPhone>();
  const [registerForm] = useForm<{ password: string; double: string }>();

  const carousel = useRef<CarouselRef>(null);

  const [openReg, setOpenReg] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [gender, setGender] = useState(-1);
  const [nickname, setNickname] = useState('');

  const restData = useCallback(() => {
    setCurrent(0);
    setGender(-1);
    setNickname('');
    setOpenReg(false);
    setRegLoading(false);
    setBtnLoading(false);
    registerForm.setFieldsValue({ password: undefined, double: undefined });
  }, []);

  const handleLogin = useCallbackPlus(
    (values: LoginWithPhone) => {
      const timer = setTimeout(async () => {
        const data = await apiHandler(() => userApi.loginWithMobile(values));
        // 如果未查询到用户信息则要么注册要么不登录
        if (!data) {
          // 转入注册流程，如果注册成功使用token登录
          setOpenReg(true);
          setBtnLoading(false);
        } else {
          restData();
          onLogin({ ...data, remember: true, auto: true });
        }
      }, cancelTime);
      if (cancel) {
        clearTimeout(timer);
        setBtnLoading(false);
      }
    },
    [cancel, restData, onLogin]
  ).before(() => {
    onBeforeLogin();
    setBtnLoading(true);
  });

  const onRegister = useCallbackPlus<UserInfo>(async () => {
    setRegLoading(true);
    const res = await apiHandler(
      () =>
        userApi.registerByPhone({
          nickname,
          gender,
          ...loginForm.getFieldsValue(),
          password: registerForm.getFieldValue('password'),
        }),
      restData,
      restData
    );
    res && onRegisterSuccess?.();
  }, [gender, nickname, onRegisterSuccess]).before(() => {
    if (eq(gender, -1)) {
      message.error('请选择您的性别');
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
    if (current < 2) {
      carousel.current?.next();
      return false;
    }
  });

  return (
    <>
      <Avatar size={56} className='login-avatar' />
      {/* 登录框 */}
      <Form form={loginForm} onFinish={handleLogin.invoke}>
        <PhoneLoginInput />
        <Form.Item>
          <Button
            block
            type='primary'
            htmlType='submit'
            loading={btnLoading}
            disabled={!online}
            style={{ marginTop: 10 }}>
            登录
          </Button>
        </Form.Item>
      </Form>
      {/* 注册 */}
      <Drawer
        {...{ openReg }}
        width='100%'
        destroyOnClose
        className='mb-register-drawer'
        onClose={restData}
        closeIcon={<LeftOutlined className='close-icon' />}>
        <Spin
          spinning={regLoading}
          tip='等待注册回应...'
          indicator={<LoadingOutlined />}
          size='large'>
          <Carousel ref={carousel} dots={false} afterChange={setCurrent}>
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
              onClick={onRegister.invoke}
            />
          </div>
        </Spin>
      </Drawer>
    </>
  );
}

export default memo(MobileLogin);
