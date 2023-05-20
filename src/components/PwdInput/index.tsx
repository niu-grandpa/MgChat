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
      <FormPwdInput {...rest} name='password' />
      {double && (
        <FormPwdInput
          match
          name='double'
          placeholder='确认密码'
          validator={(_, value) => {
            if (!eq(value, password?.())) {
              return Promise.reject(new Error('两次输入的密码不一致'));
            }
            return Promise.resolve();
          }}
        />
      )}
    </>
  );
}

export default memo(PwdInput);
