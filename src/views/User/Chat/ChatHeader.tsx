import { useGetWinKey } from '@/hooks';
import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback } from 'react';

function ChatHeader() {
  const key = useGetWinKey();

  const handler = useCallback((type: 'mini' | 'max' | 'close') => {
    const methods = {
      mini: () => ipcRenderer.send('min-win', { key }),
      max: () => ipcRenderer.send('max-win', { key }),
      close: () => {
        console.log(key);
        ipcRenderer.send('close-win', { key, keepAlive: true });
      },
    };
    return methods[type]();
  }, []);

  return (
    <Layout.Header className='chat-header'>
      <a className='nickname'>网点文档</a>
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
    </Layout.Header>
  );
}

export default ChatHeader;
