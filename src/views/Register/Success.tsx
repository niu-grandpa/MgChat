import { ResisterData } from '@/services/typing';
import { formatPhoneNumber } from '@/utils';
import { Button, Result, Typography } from '@arco-design/web-react';
import { ipcRenderer } from 'electron';

function Success({ data }: { data: Partial<ResisterData> }) {
  return (
    <Result
      status='success'
      className='result-content'
      title='注册成功'
      subTitle='感谢您注册MGChat，请回到登录界面使用!'
      style={{ paddingTop: 120 }}
      extra={
        <Button
          type='primary'
          onClick={() =>
            ipcRenderer.send('close-win', { pathname: 'register' })
          }>
          关闭
        </Button>
      }>
      <Typography style={{ background: 'var(--color-fill-2)', padding: 24 }}>
        <Typography.Paragraph>注册信息:</Typography.Paragraph>
        <ul>
          <li>昵称: {data.nickname}</li>
          <li>MG号码: {data.account}</li>
          <li>手机号码: {formatPhoneNumber(data.phoneNumber!)}</li>
        </ul>
      </Typography>
    </Result>
  );
}

export default Success;
