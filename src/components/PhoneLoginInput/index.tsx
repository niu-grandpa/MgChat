import { useCallbackPlus } from '@/hooks';
import { getRegExp } from '@/utils';
import { Button, Form, Input, Message, Space } from '@arco-design/web-react';
import { IconPhone } from '@arco-design/web-react/icon';
import { eq } from 'lodash-es';
import {
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const { phone } = getRegExp();

function PhoneLoginInput({
  prefix,
  defaultVal,
  disabledWhenHasPhone,
  disabledCaptchaInput,
}: {
  prefix?: ReactNode;
  defaultVal: string;
  disabledWhenHasPhone?: boolean;
  disabledCaptchaInput?: boolean;
}) {
  const [pnumber, setpNumber] = useState(defaultVal);
  const [isSend, setIsSend] = useState(false);

  const btnRef = useRef<HTMLElement>(null);
  const countdown = useRef(59);
  const timer = useRef<NodeJS.Timer | null>(null);

  const timing = useCallback(() => {
    if (countdown.current <= 0) {
      setIsSend(false);
      clearInterval(timer.current as unknown as number);
      timer.current = null;
      countdown.current = 59;
      btnRef.current && (btnRef.current.innerText = '发送验证码');
      return;
    }
    btnRef.current!.innerText = `已发送 ${countdown.current--}s`;
  }, [timer, countdown, btnRef]);

  const handleSend = useCallbackPlus(() => {
    Message.success('验证码已发送');
  }, []).before(() => {
    if (timer.current) return false;
    setIsSend(true);
    timer.current = setInterval(timing, 1000);
  });

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, []);

  return (
    <>
      <Form.Item
        field='phoneNumber'
        rules={[
          {
            required: true,
            match: phone,
            message: '请填写正确的手机号',
          },
        ]}
        disabled={disabledWhenHasPhone && !eq(defaultVal, '')}>
        <Input
          type='number'
          prefix={prefix || <IconPhone />}
          placeholder='手机号码'
          onChange={setpNumber}
        />
      </Form.Item>
      <Space align='baseline'>
        <Form.Item
          field='code'
          disabled={!phone.test(pnumber)}
          rules={[{ required: true, message: '请填写验证码' }]}>
          <Input
            type='number'
            placeholder='短信验证码'
            style={{ width: 208 }}
          />
        </Form.Item>
        <Button
          ref={btnRef}
          disabled={isSend || !phone.test(pnumber)}
          onClick={handleSend.invoke}
          style={{ padding: '0 14px' }}>
          发送验证码
        </Button>
      </Space>
    </>
  );
}

export default memo(PhoneLoginInput);
