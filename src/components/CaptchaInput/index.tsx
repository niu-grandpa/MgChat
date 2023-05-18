import { useCallbackPlus } from '@/hooks';
import { Form, Input, Link, Message } from '@arco-design/web-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

function CaptchaFormInput({
  field,
  disabled,
}: {
  field: string;
  disabled?: boolean;
}) {
  const [isSend, setIsSend] = useState(disabled);

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
    btnRef.current!.innerText = `发送验证码(${countdown.current--}s)`;
  }, [timer, countdown, btnRef]);

  const handleSend = useCallbackPlus(() => {
    Message.success('验证码已发送');
  }, []).before(() => {
    if (timer.current) return false;
    setIsSend(true);
    timer.current = setInterval(timing, 1000);
  });

  useEffect(() => {
    setIsSend(disabled);
  }, [disabled]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, []);

  return (
    <Form.Item
      {...{ field }}
      rules={[{ required: true, message: '请输入验证码' }]}>
      <Input
        type='number'
        placeholder='短信验证码'
        suffix={
          <Link
            ref={btnRef}
            hoverable={false}
            disabled={isSend}
            onClick={handleSend.invoke}>
            发送验证码
          </Link>
        }
      />
    </Form.Item>
  );
}

export default memo(CaptchaFormInput);
