import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

function ChatHeader() {
  const { pathname } = useLocation();
  const fn = useMemo(
    () => ({
      minimize: () => ipcRenderer.send('minimize', { pathname }),
      maximize: () => ipcRenderer.send('maximize', { pathname }),
      close: () => {
        console.log(pathname);
        ipcRenderer.send('close-win', { pathname, keepAlive: true });
      },
    }),
    [pathname]
  );

  return (
    <Layout.Header className='chat-header'>
      <a className='nickname'>网点文档</a>
      <nav className='menubar'>
        <span className='menubar-item' title='最小化' onClick={fn['minimize']}>
          <MinusOutlined />
        </span>
        <span className='menubar-item' title='最大化' onClick={fn['maximize']}>
          <BorderOutlined />
        </span>
        <span className='menubar-item' title='关闭' onClick={fn['close']}>
          <CloseOutlined />
        </span>
      </nav>
    </Layout.Header>
  );
}

export default ChatHeader;
