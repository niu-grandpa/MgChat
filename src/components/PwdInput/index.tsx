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
  IconEye,
  IconEyeInvisible,
  IconInfoCircle,
  IconLock,
} from '@arco-design/web-react/icon';
import { eq } from 'lodash-es';
import { memo, useRef, useState } from 'react';

type Props = {
  field: string;
  showTip: boolean;
  match: boolean;
  placeholder: string;
  validator: RulesProps['validator'];
  tipPosition: TooltipProps['position'];
};

const { pwd } = getRegExp();

function PwdInput({
  field,
  match,
  showTip,
  validator,
  placeholder,
  tipPosition,
}: Partial<Props>) {
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

  const [seePwd, setSeePwd] = useState(false);
  const [isRightPwd, setIsRightPwd] = useState(false);

  return (
    <Tooltip
      disabled={!showTip}
      position={tipPosition}
      content={
        <>
          <p>
            <IconInfoCircle style={{ color: '#165dff' }} /> 不能包括中文和空格
          </p>
          <p style={{ paddingLeft: 15 }}>长度为8-16个字符</p>
          <p style={{ paddingLeft: 15 }}>必须包含字母、数字、符号2种</p>
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
          onChange={v => setIsRightPwd(pwd.test(v))}
          suffix={
            <>
              {isRightPwd && (
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

export default memo(PwdInput);
