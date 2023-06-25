import { useOnline } from '@/hooks';
import { Alert, AlertProps } from 'antd';
import { memo } from 'react';

function NetAlert(props: AlertProps) {
  const isOnline = useOnline();
  return !isOnline ? (
    <Alert
      type='warning'
      banner
      message='当前无法连接网络，请检查后重试。'
      {...props}
    />
  ) : null;
}

export default memo(NetAlert);
