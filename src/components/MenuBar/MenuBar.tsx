import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { ipcRenderer } from 'electron';
import { memo, useMemo } from 'react';
import './index.scss';

function MenuBar() {
  const handler = useMemo(
    () => (type: 'mini' | 'max' | 'close') => {
      const methods = {
        mini: () => ipcRenderer.send('min-win', { pathname: 'chat' }),
        max: () => ipcRenderer.send('max-win', { pathname: 'chat' }),
        close: () =>
          ipcRenderer.send('close-win', { pathname: 'chat', keepAlive: true }),
      };
      return methods[type]();
    },
    []
  );

  return (
    <nav className='menubar'>
      <span
        className='menubar-item'
        title='最小化'
        onClick={() => handler('mini')}>
        <MinusOutlined />
      </span>
      <span
        className='menubar-item'
        title='最大化'
        onClick={() => handler('max')}>
        <BorderOutlined />
      </span>
      <span
        className='menubar-item'
        title='关闭'
        onClick={() => handler('close')}>
        <CloseOutlined />
      </span>
    </nav>
  );
}

export default memo(MenuBar);
