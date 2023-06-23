import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { ipcRenderer } from 'electron';
import { memo, useCallback, useMemo } from 'react';
import './index.scss';

type Props = {
  offset: [number | string, number | string];
  size?: number;
  /**对应窗口的路由路径 */
  pathname: string;
  /**窗口关闭后保存存活状态 */
  keepAliveWhenClosed: boolean;
  onClose?: () => void;
};

function ActionBar({
  offset,
  size,
  pathname,
  onClose,
  keepAliveWhenClosed,
}: Props) {
  const style = useMemo(
    () => ({ top: offset[0], left: offset[1], fontSize: size }),
    [offset, size]
  );

  const onAction = useCallback(
    (channel: string) => {
      const params = { pathname };
      if (channel === 'close-win') {
        // @ts-ignore
        params['keepAlive'] = keepAliveWhenClosed;
      }
      onClose?.();
      ipcRenderer.send(channel, params);
    },
    [pathname, onClose, keepAliveWhenClosed]
  );

  return (
    <div className='act-bar' style={style}>
      <MinusOutlined onClick={() => onAction('minimize')} title='最小化' />
      <BorderOutlined onClick={() => onAction('maximize')} title='最大化' />
      <CloseOutlined
        title='关闭'
        className='close'
        onClick={() => onAction('close-win')}
      />
    </div>
  );
}

export default memo(ActionBar);
