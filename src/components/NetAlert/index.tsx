import { useOnline } from '@/hooks';
import { Alert, AlertProps } from 'antd';
import { memo } from 'react';

function NetAlert(props: AlertProps) {
  const isOnline = useOnline();
  return !isOnline ? (
    <Alert
      type='error'
      banner
      message='当前无网络连接，请稍后重试。'
      {...props}
    />
  ) : null;
}

export default memo(NetAlert);
