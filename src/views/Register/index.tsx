import UAvatar from '@/components/Avatar';
import CaptchaFormInput from '@/components/CaptchaInput';
import PwdFormInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { ResisterData } from '@/services/typing';
import { getRegExp } from '@/utils';
import {
  Button,
  Form,
  FormInstance,
  Input,
  Layout,
  Spin,
  Typography,
} from '@arco-design/web-react';
import { IconPhone, IconUser } from '@arco-design/web-react/icon';
import { eq } from 'lodash-es';
import { useState } from 'react';
import Success from './Success';
import './index.scss';

const { Header, Content } = Layout;
const { useForm, useWatch } = Form;
const { Title } = Typography;
const { phone } = getRegExp();

function RegisterView() {
  const [form] = useForm<ResisterData>();
  const phoneNumber = useWatch('phoneNumber', form as FormInstance);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallbackPlus<string>(async (values: ResisterData) => {
    setLoading(true);
    return new Promise(res => {
      setTimeout(() => {
        res('2864103063');
      }, 2000);
    });
  }, []).after(account => {
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
                  showTip
                  field='password'
                  tipPosition='left'
                />
                <PwdFormInput
                  match
                  field='pwdConfirm'
                  placeholder='确认密码'
                  validator={(value, callback) => {
                    if (eq(value, undefined)) {
                      return callback('请填写密码');
                    }
                    if (!eq(value, form.getFieldValue('password'))) {
                      return callback('两次输入的密码不一致');
                    }
                  }}
                />
                <Form.Item
                  field='phoneNumber'
                  rules={[
                    {
                      required: true,
                      match: phone,
                      message: '请填写正确的手机号',
                    },
                  ]}>
                  <Input
                    type='number'
                    prefix={<IconPhone />}
                    placeholder='手机号码'
                  />
                </Form.Item>
                <CaptchaFormInput
                  field='code'
                  disabled={!phone.test(phoneNumber)}
                />
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
