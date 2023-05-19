import PhoneLoginFormInput from '@/components/PhoneLoginInput';
import PwdInput from '@/components/PwdInput';
import { useCallbackPlus } from '@/hooks';
import { ChangePassword } from '@/services/typing';
import { getRegExp } from '@/utils';
import { Button, Form, Result, Steps } from '@arco-design/web-react';
import { eq, gt } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './index.scss';

const { Step } = Steps;
const { useForm } = Form;
const { phone } = getRegExp();

function Forget() {
  const [form] = useForm<ChangePassword>();
  const [search] = useSearchParams();

  const account = useMemo(() => {
    const val = search.get('account');
    if (val && phone.test(val)) return val;
    return '';
  }, [search]);

  const [step, setStep] = useState(1);

  const handleSubmit = useCallbackPlus((values: ChangePassword) => {
    // todo
    console.log(values);
  }, [])
    .before(({ code }: ChangePassword) => {
      if (eq(step, 1)) {
        // todo 判断验证码是否过期
        setStep(2);
        return false;
      }
    })
    .after(() => setStep(3));

  return (
    <main className='forget'>
      <Steps current={step} onChange={setStep}>
        <Step title='验证身份' disabled={!gt(step, 1) || eq(step, 3)} />
        <Step title='设置密码' disabled={!gt(step, 2) || eq(step, 3)} />
        <Step title='改密成功' disabled />
      </Steps>
      {!eq(step, 3) ? (
        <Form<ChangePassword>
          size='large'
          className='forget-form'
          validateTrigger={'onBlur'}
          form={form}
          initialValues={{ phoneNumber: account }}
          onSubmit={handleSubmit.invoke}>
          {eq(step, 1) ? (
            <PhoneLoginFormInput
              defaultVal={account}
              disabledWhenHasPhone
              prefix='原手机号 |'
            />
          ) : eq(step, 2) ? (
            <PwdInput
              match
              showTip
              double
              tipPosition='top'
              placeholder='新的密码'
              password={() => form.getFieldValue('password')}
            />
          ) : null}
          {!eq(step, 3) && (
            <Form.Item style={{ marginTop: 16 }}>
              <Button htmlType='submit' long type='primary'>
                下一步
              </Button>
            </Form.Item>
          )}
        </Form>
      ) : (
        <Result status='success' title='修改成功' />
      )}
    </main>
  );
}

export default Forget;
