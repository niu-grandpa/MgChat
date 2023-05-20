import PhoneLoginFormInput from '@/components/PhoneLoginInput';
import PwdInput from '@/components/PwdInput';
import { useCallbackPlus, useCheckVerificationCode } from '@/hooks';
import { ChangePassword } from '@/services/typing';
import { getRegExp } from '@/utils';
import { Button, Form, Result, Steps } from 'antd';
import { eq } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './index.scss';

const { useForm } = Form;
const { phone } = getRegExp();

function Forget() {
  const [form] = useForm<ChangePassword>();
  const [search] = useSearchParams();
  const checkCode = useCheckVerificationCode();

  const account = useMemo(() => {
    const val = search.get('account');
    if (val && phone.test(val)) return val;
    return '';
  }, [search]);

  const [current, setCurrent] = useState(0);

  const handleNext = useCallbackPlus((val: number) => {
    setCurrent(val);
  }, []).before(() => {});

  const handleSubmit = useCallbackPlus((values: ChangePassword) => {
    // todo
    console.log(values);
    setCurrent(v => ++v);
  }, []).before(({ code }: ChangePassword) => {
    if (eq(current, 0)) {
    }
  });

  return (
    <main className='forget'>
      <Steps
        current={current}
        onChange={handleNext.invoke}
        items={[
          { title: '验证身份' },
          { title: '设置密码' },
          { title: '改密成功' },
        ]}
      />
      {!eq(current, 2) ? (
        <Form<ChangePassword>
          size='large'
          className='forget-form'
          form={form}
          initialValues={{ phoneNumber: account }}
          onFinish={handleSubmit.invoke}>
          {eq(current, 0) ? (
            <PhoneLoginFormInput
              defaultVal={account}
              disabledWhenHasPhone
              addonBefore='原手机号'
            />
          ) : eq(current, 1) ? (
            <PwdInput
              match
              showTip
              double
              placeholder='新的密码'
              password={() => form.getFieldValue('password')}
            />
          ) : null}
          <Form.Item>
            <Button htmlType='submit' block type='primary'>
              下一步
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Result status='success' title='修改成功' />
      )}
    </main>
  );
}

export default Forget;
