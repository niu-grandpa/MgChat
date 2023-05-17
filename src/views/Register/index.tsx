import UAvatar from '@/components/Avatar';
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
  Typography,
} from '@arco-design/web-react';
import { useState } from 'react';
import './index.scss';

const { Header, Content } = Layout;
const { useForm } = Form;
const { Title } = Typography;
const { name, phone, pwd } = getRegExp();

function RegisterView() {
  const [form] = useForm<ResisterData>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallbackPlus(async (values: ResisterData) => {
    setLoading(v => !v);
    const sleep = new Promise(res => {
      setTimeout(() => {
        res(1);
      }, 2000);
    });
    return await sleep;
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
            <Title heading={6}>像MG机枪一样，聊个不停</Title>
            <Form size='large' form={form} onSubmit={handleSubmit.invoke}>
              <Form.Item
                field='nickname'
                rules={[
                  {
                    required: true,
                    match: name,
                    message: '只能包含汉字,数字,字母和下划线',
                  },
                ]}>
                <Input placeholder='昵称' />
              </Form.Item>
              <Form.Item
                field='password'
                rules={[
                  {
                    required: true,
                    match: pwd,
                    minLength: 8,
                    maxLength: 12,
                    message: '密码须8-12位,含大小写字母,特殊字符和数字',
                  },
                ]}>
                <Input type='password' placeholder='密码' />
              </Form.Item>
              <Form.Item
                field='phoneNumber'
                rules={[
                  {
                    required: true,
                    match: phone,
                    message: '请输入正确的手机号码',
                  },
                ]}>
                <Input type='number' placeholder='手机号' />
              </Form.Item>
              <Form.Item
                field='code'
                rules={[{ required: true, message: '请输入验证码' }]}>
                <Input
                  type='number'
                  placeholder='验证码'
                  addAfter={
                    <Button size='mini' type='text'>
                      发送
                    </Button>
                  }
                />
              </Form.Item>
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
