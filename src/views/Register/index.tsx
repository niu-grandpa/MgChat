import UAvatar from '@/components/Avatar';
import PhoneLoginFormInput from '@/components/PhoneLoginInput';
import PwdFormInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { ResisterData } from '@/services/typing';
import {
  Button,
  Form,
  Input,
  Layout,
  Spin,
  Typography,
} from '@arco-design/web-react';
import { IconUser } from '@arco-design/web-react/icon';
import { useState } from 'react';
import Success from './Success';
import './index.scss';

const { Header, Content } = Layout;
const { useForm, useWatch } = Form;
const { Title } = Typography;

function RegisterView() {
  const [form] = useForm<ResisterData>();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setLoading(true);
      // todo 判断验证码是否过期
    })
    .after(account => {
      form.setFieldsValue({ account });
      setLoading(false);
      setSuccess(v => !v);
    });

  return (
    <Spin dot {...{ loading }} style={{ display: 'block' }}>
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
              <Title heading={2}>欢迎注册</Title>
              <Title heading={6}>噼里啪啦，像机枪一样聊不停!</Title>
              <Form
                size='large'
                form={form}
                validateTrigger={['onFocus', 'onBlur']}
                onSubmit={handleSubmit.invoke}>
                <Form.Item
                  field='nickname'
                  rules={[
                    {
                      required: true,
                      minLength: 1,
                      message: '昵称不可以为空',
                    },
                  ]}>
                  <Input placeholder='昵称' prefix={<IconUser />} />
                </Form.Item>
                <PwdFormInput
                  match
                  double
                  showTip
                  tipPosition='left'
                  password={() => form.getFieldValue('password') as string}
                />
                <PhoneLoginFormInput defaultVal='' />
                <Form.Item hidden field='account'>
                  <Input />
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
      )}
    </Spin>
  );
}

export default RegisterView;
