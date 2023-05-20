import { getRegExp } from '@/utils';
import { CheckCircleTwoTone, LockOutlined } from '@ant-design/icons';
import { Form, Input, Tooltip } from 'antd';
import { ChangeEvent, memo, useCallback, useRef, useState } from 'react';

export type FormPwdInputProps = {
  name: string;
  showTip: boolean;
  match: boolean;
  placeholder: string;
  validator: (rule: any, value: string) => Promise<any>;
};

const { pwd } = getRegExp();

function FormPwdInput({
  name,
  match,
  showTip,
  validator,
  placeholder,
}: Partial<FormPwdInputProps>) {
  const _validator = useRef(
    validator ||
      ((_: any, value: string) => {
        if (!value) return Promise.reject(new Error('请填写您的密码'));
        if (!pwd.test(value))
          return Promise.reject(new Error('密码不符合格式'));
        return Promise.resolve();
      })
  );

  const [value, setValue] = useState('');
  const [isRightPwd, setIsRightPwd] = useState(false);

  const handleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      setValue(target.value);
      setIsRightPwd(pwd.test(target.value));
    },
    []
  );

  const Tip = ({ reg, tip }: { reg: RegExp; tip: string }) => (
    <div>
      <CheckCircleTwoTone
        style={{
          width: 24,
          visibility: reg.test(value) ? 'visible' : 'hidden',
        }}
        twoToneColor='#52c41a'
      />
      {tip}
    </div>
  );

  return (
    <Tooltip
      trigger='focus'
      color='white'
      overlayInnerStyle={{ fontSize: 12, color: '#000000e0' }}
      title={
        !showTip ? null : (
          <>
            <Tip reg={/^[^\u4E00-\u9FA5\s]+$/} tip='不能包括中文和空格' />
            <Tip reg={/^.{8,16}$/} tip='长度为8-16个字符' />
            <Tip
              reg={/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{0,}$/}
              tip='必须包含字母、数字、符号2种'
            />
          </>
        )
      }>
      <Form.Item
        hasFeedback
        name={name}
        rules={[
          match
            ? {
                required: true,
                pattern: pwd,
                validator: _validator.current,
              }
            : {},
        ]}
        validateStatus={isRightPwd ? 'success' : ''}>
        <Input.Password
          placeholder={placeholder || '密码'}
          prefix={<LockOutlined />}
          onChange={handleChange}
        />
      </Form.Item>
    </Tooltip>
  );
}

export default memo(FormPwdInput);
