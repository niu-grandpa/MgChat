import PhoneLoginInput from '@/components/PhoneLoginInput';
import { useCallbackPlus } from '@/hooks';
import { Button, Form } from 'antd';
import { memo, useState } from 'react';

type LoginWithPwd = {
  phoneNumber: string;
  code: string;
};

function MobileLogin() {
  const [code, setCode] = useState<string>('');

  const handleSubmit = useCallbackPlus((values: LoginWithPwd) => {}, []).before(
    values => {}
  );

  return (
    <Form onFinish={handleSubmit.invoke}>
      <PhoneLoginInput defaultVal='' />
      <Form.Item>
        <Button block type='primary' htmlType='submit'>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}

export default memo(MobileLogin);
