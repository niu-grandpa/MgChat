import { useCallbackPlus, useCheckVerificationCode } from '@/hooks';
import { getRegExp } from '@/utils';
import { PhoneOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { eq } from 'lodash-es';
import {
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type Props = {
  prefix: ReactNode;
  addonBefore: ReactNode;
  defaultVal: string;
  inputWidth: number;
  onSendCode: (code: string) => void;
  disabledWhenHasPhone: boolean;
};

const { phone } = getRegExp();

function PhoneLoginInput({
  prefix,
  onSendCode,
  addonBefore,
  defaultVal,
  inputWidth,
  disabledWhenHasPhone,
}: Partial<Props>) {
  const { set: setCode, createMap } = useCheckVerificationCode();

  const [isSend, setIsSend] = useState(false);
  const [pnumber, setpNumber] = useState(defaultVal || '');

  const countdown = useRef(59);
  const btnRef = useRef<HTMLElement>(null);
  const timer = useRef<NodeJS.Timer | null>(null);

  const disabled = useMemo(() => !phone.test(pnumber), [pnumber]);

  useEffect(() => {
    createMap();
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, []);

  const timing = useCallback(() => {
    if (countdown.current <= 0) {
      setIsSend(false);
      clearInterval(timer.current as unknown as number);
      timer.current = null;
      countdown.current = 59;
      btnRef.current && (btnRef.current.innerText = '发送验证码');
      return;
    }
    btnRef.current!.innerText = `重新获取 ${countdown.current--}s`;
  }, [timer, countdown, btnRef]);

  const handleSend = useCallbackPlus(() => {
    // todo 发送验证码
  }, [])
    .before(() => {
      if (timer.current) return false;
      setIsSend(true);
      message.success('验证码已发送');
      timer.current = setInterval(timing, 1000);
    })
    .after(() => {
      onSendCode?.('');
    });

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
      <Form.Item
        name='code'
        rules={[{ required: true, message: '请填写验证码' }]}>
        <Input
          type='number'
          placeholder='短信验证码'
          suffix={
            <Button
              ref={btnRef}
              type='link'
              size='small'
              disabled={isSend || disabled}
              onClick={handleSend.invoke}>
              获取验证码
            </Button>
          }
        />
      </Form.Item>
    </>
  );
}

export default memo(PhoneLoginInput);
