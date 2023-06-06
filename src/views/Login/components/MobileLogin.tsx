import Avatar from '@/components/Avatar';
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
    <>
      <Avatar size={58} className='login-avatar' />
      <Form size='large' onFinish={handleSubmit.invoke}>
        <PhoneLoginInput inputWidth={189} />
        <Form.Item>
          <Button block type='primary' htmlType='submit'>
            登录
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default memo(MobileLogin);
