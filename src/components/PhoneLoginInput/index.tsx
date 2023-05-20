import { useCallbackPlus } from '@/hooks';
import { getRegExp } from '@/utils';
import { PhoneOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Space } from 'antd';
import { eq } from 'lodash-es';
import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type Props = {
  prefix?: ReactNode;
  addonBefore?: ReactNode;
  defaultVal: string;
  disabledWhenHasPhone?: boolean;
};

const { phone } = getRegExp();

function PhoneLoginInput({
  prefix,
  addonBefore,
  defaultVal,
  disabledWhenHasPhone,
}: Props) {
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
    message.success('验证码已发送');
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
        name='phoneNumber'
        rules={[
          {
            required: true,
            pattern: phone,
            message: '请填写正确的手机号',
          },
        ]}>
        <Input
          type='number'
          addonBefore={addonBefore}
          prefix={!addonBefore && (prefix || <PhoneOutlined />)}
          placeholder='手机号码'
          onChange={e => setpNumber(e.target.value)}
          disabled={disabledWhenHasPhone && !eq(defaultVal, '')}
        />
      </Form.Item>
      <Space.Compact block>
        <Form.Item
          name='code'
          style={{ width: '35%' }}
          rules={[{ required: true, message: '请填写验证码' }]}>
          <Input
            type='number'
            placeholder='短信验证码'
            disabled={!phone.test(pnumber)}
          />
        </Form.Item>
        <Button
          ref={btnRef}
          disabled={isSend || !phone.test(pnumber)}
          onClick={handleSend.invoke}
          style={{ padding: '0 14px' }}>
          发送验证码
        </Button>
      </Space.Compact>
    </>
  );
}

export default memo(PhoneLoginInput);
