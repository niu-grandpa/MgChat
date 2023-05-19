import { getRegExp } from '@/utils';
import {
  Form,
  Input,
  RulesProps,
  Tooltip,
  TooltipProps,
} from '@arco-design/web-react';
import {
  IconCheck,
  IconCheckCircle,
  IconEye,
  IconEyeInvisible,
  IconLock,
} from '@arco-design/web-react/icon';
import { eq } from 'lodash-es';
import { memo, useCallback, useRef, useState } from 'react';

export type FormPwdInputProps = {
  field: string;
  showTip: boolean;
  match: boolean;
  placeholder: string;
  validator: RulesProps['validator'];
  tipPosition: TooltipProps['position'];
};

const { pwd } = getRegExp();

function FormPwdInput({
  field,
  match,
  showTip,
  validator,
  placeholder,
  tipPosition,
}: Partial<FormPwdInputProps>) {
  const _validator = useRef(
    validator ||
      ((val: string, cb: (msg: string) => void) => {
        if (eq(val, undefined)) {
          return cb('请您填写密码');
        }
      })
  );

  const customRules = useRef({
    match: pwd,
    required: true,
    minLength: 8,
    maxLength: 16,
    validator: _validator.current,
  });

  const [value, setValue] = useState('');
  const [seePwd, setSeePwd] = useState(false);
  const [isRightPwd, setIsRightPwd] = useState(false);

  const Tip = ({ reg, tip }: { reg: RegExp; tip: string }) => (
    <p>
      <IconCheckCircle
        style={{
          width: 16,
          color: 'rgb(var(--success-6))',
          visibility: reg.test(value) ? 'visible' : 'hidden',
        }}
      />
      {tip}
    </p>
  );

  const handleChange = useCallback((v: string) => {
    setValue(v);
    setIsRightPwd(pwd.test(v));
  }, []);

  return (
    <Tooltip
      disabled={!showTip}
      position={tipPosition}
      className='tooltip-white'
      content={
        <>
          <Tip reg={/^[^\u4E00-\u9FA5\s]+$/} tip='不能包括中文和空格' />
          <Tip reg={/^.{8,16}$/} tip='长度为8-16个字符' />
          <Tip
            reg={/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{0,}$/}
            tip='必须包含字母、数字、符号2种'
          />
        </>
      }
      mini
      color='#fff'>
      <Form.Item
        field={field}
        rules={[
          match
            ? customRules.current
            : {
                required: true,
                validator: _validator.current,
              },
        ]}>
        <Input
          type={seePwd ? 'text' : 'password'}
          placeholder={placeholder || '密码'}
          prefix={<IconLock />}
          onChange={handleChange}
          suffix={
            <>
              {match && isRightPwd && (
                <IconCheck style={{ color: 'green', marginRight: 6 }} />
              )}
              {seePwd ? (
                <IconEye onClick={() => setSeePwd(false)} />
              ) : (
                <IconEyeInvisible onClick={() => setSeePwd(true)} />
              )}
            </>
          }
        />
      </Form.Item>
    </Tooltip>
  );
}

export default memo(FormPwdInput);
