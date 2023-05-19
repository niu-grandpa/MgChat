import { eq } from 'lodash';
import { memo } from 'react';
import FormPwdInput, { FormPwdInputProps } from './FormPwdInput';

type Props = {
  double: boolean;
  password: () => string;
} & FormPwdInputProps;

function PwdInput({ double, password, ...rest }: Partial<Props>) {
  return (
    <>
      <FormPwdInput {...rest} field='password' />
      {double && (
        <FormPwdInput
          match
          field='double'
          placeholder='确认密码'
          validator={(value, callback) => {
            if (eq(value, undefined)) {
              return callback('请您填写密码');
            }
            if (!eq(value, password?.())) {
              return callback('两次输入的密码不一致');
            }
          }}
        />
      )}
    </>
  );
}

export default memo(PwdInput);
