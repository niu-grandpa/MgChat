import { ResisterData } from '@/services/typing';
import { formatPhoneNumber } from '@/utils';
import { Button, Result, Typography } from 'antd';
import { ipcRenderer } from 'electron';

const { Paragraph, Text } = Typography;

function Success({ data }: { data: Partial<ResisterData> }) {
  return (
    <Result
      status='success'
      className='result-content'
      title='注册成功'
      subTitle='感谢您注册MGChat，祝您聊天愉快!'
      extra={
        <Button
          type='primary'
          onClick={() =>
            ipcRenderer.send('close-win', { pathname: 'register' })
          }>
          关闭
        </Button>
      }>
      <section style={{ padding: 24, background: '#fff' }}>
        <Paragraph>
          <Text strong style={{ fontSize: 16 }}>
            用户注册信息:
          </Text>
        </Paragraph>
        <Paragraph>昵称: {data.nickname}</Paragraph>
        <Paragraph>
          MG号码: <code>{data.account}</code>
        </Paragraph>
        <Paragraph>手机号码: {formatPhoneNumber(data.phoneNumber!)}</Paragraph>
      </section>
    </Result>
  );
}

export default Success;
