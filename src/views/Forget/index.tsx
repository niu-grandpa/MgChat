import PhoneLoginFormInput from '@/components/PhoneLoginInput';
import PwdInput from '@/components/PwdInput';
import { useCallbackPlus, useCheckVerificationCode } from '@/hooks';
import { ChangePassword } from '@/services/typing';
import { getRegExp } from '@/utils';
import { Button, Form, Result, Space, Steps } from 'antd';
import { ipcRenderer } from 'electron';
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

  const [current, setCurrent] = useState(0);

  const account = useMemo(() => {
    const val = search.get('account') || form.getFieldValue('phoneNumber');
    if (val && phone.test(val)) return val;
    return '';
  }, [search, form]);

  const display = useMemo(
    () => (i: number) => eq(current, i) ? '' : 'none',
    [current]
  );

  const handleSubmit = useCallbackPlus((values: ChangePassword) => {
    // todo
    console.log(values);
    setCurrent(v => ++v);
  }, []).before(({ phoneNumber, code }: ChangePassword) => {
    if (eq(current, 0) && !checkCode.isValid(phoneNumber, code)) {
      return false;
    }
  });

  return (
    <main className='forget'>
      <Steps
        current={current}
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
          <div style={{ display: display(0) }}>
            <PhoneLoginFormInput
              defaultVal={account}
              disabledWhenHasPhone
              addonBefore='原手机号'
            />
          </div>
          <div style={{ display: display(1) }}>
            <PwdInput
              showTip
              double
              placeholder='新的密码'
              match={!display(1)}
              password={() => form.getFieldValue('password')}
            />
          </div>
          <Form.Item>
            {!display(1) ? (
              <Space>
                <Button onClick={() => setCurrent(v => --v)}>上一步</Button>
                <Button style={{ width: 310 }} htmlType='submit' type='primary'>
                  下一步
                </Button>
              </Space>
            ) : (
              <Button block htmlType='submit' type='primary'>
                下一步
              </Button>
            )}
          </Form.Item>
        </Form>
      ) : (
        <Result
          status='success'
          title='修改成功'
          extra={
            <Button
              type='primary'
              onClick={() =>
                ipcRenderer.send('close-win', { pathname: 'forget' })
              }>
              关闭
            </Button>
          }
        />
      )}
    </main>
  );
}

export default Forget;
