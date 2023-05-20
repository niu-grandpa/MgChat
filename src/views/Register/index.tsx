import UAvatar from '@/components/Avatar';
import PhoneLoginFormInput from '@/components/PhoneLoginInput';
import PwdFormInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { ResisterData } from '@/services/typing';
import { UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, Spin, Typography } from 'antd';
import { useState } from 'react';
import Success from './Success';
import './index.scss';

const { Header, Content } = Layout;
const { useForm } = Form;
const { Title } = Typography;

function RegisterView() {
  const [form] = useForm<ResisterData>();
  const [success, setSuccess] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleSubmit = useCallbackPlus<string>(async (values: ResisterData) => {
    // @ts-ignore
    delete values['double'];
    return new Promise(res => {
      setTimeout(() => {
        res('2864103063');
      }, 2000);
    });
  }, [])
    .before(async ({ code }: ResisterData) => {
      setSpinning(true);
      // todo 判断验证码是否过期
    })
    .after(account => {
      form.setFieldsValue({ account });
      setSpinning(false);
      setSuccess(v => !v);
    });

  return (
    <Spin {...{ spinning }} style={{ display: 'block' }}>
      {success ? (
        <Success data={form.getFieldsValue()} />
      ) : (
        <Layout className='reg'>
          <Header className='reg-header'>
            <UAvatar size={30} />
            <span className='reg-header-title'>MG</span>
          </Header>
          <Content className='reg-content'>
            <section className='reg-content-form'>
              <Title level={2}>欢迎注册</Title>
              <Title level={5}>噼里啪啦，像机枪一样聊不停!</Title>
              <Form
                size='large'
                form={form}
                validateTrigger={['onFocus', 'onBlur']}
                onFinish={handleSubmit.invoke}>
                <Form.Item
                  name='nickname'
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      min: 1,
                      message: '昵称不可以为空',
                    },
                  ]}>
                  <Input placeholder='昵称' prefix={<UserOutlined />} />
                </Form.Item>
                <PwdFormInput
                  match
                  double
                  showTip
                  password={() => form.getFieldValue('password')}
                />
                <PhoneLoginFormInput defaultVal='' />
                <Form.Item hidden name='account'>
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button block type='primary' htmlType='submit'>
                    立即注册
                  </Button>
                </Form.Item>
              </Form>
            </section>
          </Content>
        </Layout>
      )}
    </Spin>
  );
}

export default RegisterView;
