import UAvatar from '@/components/Avatar';
import CaptchaFormInput from '@/components/CaptchaInput';
import { useCallbackPlus } from '@/hooks';
import { ResisterData } from '@/services/typing';
import { getRegExp } from '@/utils';
import {
  Button,
  Form,
  Input,
  Layout,
  Message,
  Spin,
  Tooltip,
  Typography,
} from '@arco-design/web-react';
import {
  IconCheck,
  IconEye,
  IconEyeInvisible,
  IconInfoCircle,
} from '@arco-design/web-react/icon';
import { useState } from 'react';
import './index.scss';

const { Header, Content } = Layout;
const { useForm } = Form;
const { Title } = Typography;
const { phone, pwd } = getRegExp();

function RegisterView() {
  const [form] = useForm<ResisterData>();

  const [seePwd, setSeePwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSendCode, setIsSendCode] = useState(true);
  const [isRightPwd, setIsRightPwd] = useState(false);

  const handleSubmit = useCallbackPlus((values: ResisterData) => {
    setLoading(v => !v);
    return 1;
  }, []).after(res => {
    console.log(res);
    setLoading(v => !v);
    Message.success('注册成功');
  });

  return (
    <Spin dot {...{ loading }} style={{ display: 'block' }}>
      <Layout className='reg'>
        <Header className='reg-header'>
          <UAvatar size={30} />
          <span className='reg-header-title'>MG</span>
        </Header>
        <Content className='reg-content'>
          <section className='reg-content-form'>
            <Title heading={2}>欢迎注册</Title>
            <Title heading={6}>噼里啪啦，像机枪一样聊不停!</Title>
            <Form
              size='large'
              form={form}
              onSubmit={handleSubmit.invoke}
              onValuesChange={(_, { phoneNumber, password }) => {
                setIsRightPwd(() => pwd.test(password!));
                setIsSendCode(() => !phone.test(phoneNumber!));
              }}>
              <Form.Item
                field='nickname'
                rules={[
                  {
                    required: true,
                    minLength: 1,
                    message: '昵称不可以为空',
                  },
                ]}>
                <Input placeholder='昵称' />
              </Form.Item>
              <Tooltip
                position='left'
                content={
                  <>
                    <p>
                      <IconInfoCircle style={{ color: '#165dff' }} />{' '}
                      不能包括中文和空格
                    </p>
                    <p style={{ paddingLeft: 15 }}>长度为8-16个字符</p>
                    <p style={{ paddingLeft: 15 }}>
                      必须包含字母、数字、符号2种
                    </p>
                  </>
                }
                mini
                color='#fff'>
                <Form.Item
                  field='password'
                  rules={[
                    {
                      required: true,
                      match: pwd,
                      minLength: 8,
                      maxLength: 16,
                      message: '密码格式不正确',
                    },
                  ]}>
                  <Input
                    type={seePwd ? 'text' : 'password'}
                    placeholder='密码'
                    suffix={
                      isRightPwd && (
                        <>
                          <IconCheck
                            style={{ color: 'green', marginRight: 6 }}
                          />
                          {seePwd ? (
                            <IconEye onClick={() => setSeePwd(false)} />
                          ) : (
                            <IconEyeInvisible onClick={() => setSeePwd(true)} />
                          )}
                        </>
                      )
                    }
                  />
                </Form.Item>
              </Tooltip>
              <Form.Item
                field='phoneNumber'
                rules={[
                  {
                    required: true,
                    match: phone,
                    message: '请填写正确的手机号',
                  },
                ]}>
                <Input type='number' placeholder='手机号码' />
              </Form.Item>
              <CaptchaFormInput field='code' disabled={isSendCode} />
              <Form.Item>
                <Button long type='primary' htmlType='submit'>
                  立即注册
                </Button>
              </Form.Item>
            </Form>
          </section>
        </Content>
      </Layout>
    </Spin>
  );
}

export default RegisterView;
