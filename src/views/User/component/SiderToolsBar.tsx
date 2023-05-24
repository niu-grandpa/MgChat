import UAvatar from '@/components/Avatar';
import {
  LogoutOutlined,
  MessageOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupDeleteOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space } from 'antd';
import { ipcRenderer } from 'electron';
import { eq } from 'lodash-es';
import { memo, useCallback, useState } from 'react';

function SiderToolsBar({ onChange }: { onChange: (tab: number) => void }) {
  const [cur, setCur] = useState(0);

  const handleClick = useCallback(
    (tab: number) => {
      setCur(tab);
      onChange(tab);
    },
    [onChange]
  );
  const handleLogout = useCallback(() => {
    //
  }, []);
  return (
    <>
      <div>
        <UAvatar
          size='large'
          onClick={() => {
            ipcRenderer.send('open-win', {
              pathname: 'chat',
              title: '聊天',
              frame: false,
              alive: true,
              width: 580,
              height: 520,
            });
          }}
        />
        <Badge status='success' className='user-siderbar-status' />
      </div>
      <Space wrap direction='vertical' className='user-siderbar-space'>
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(0)}
            icon={<MessageOutlined />}
            className={eq(cur, 0) ? 'active' : ''}
          />
        </Badge>
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(1)}
            icon={<UserOutlined />}
            className={eq(cur, 1) ? 'active' : ''}
          />
        </Badge>
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(2)}
            icon={<UsergroupDeleteOutlined />}
            className={eq(cur, 2) ? 'active' : ''}
          />
        </Badge>
        <Button
          type='text'
          size='large'
          onClick={() => handleClick(3)}
          icon={<PlusOutlined />}
          className={eq(cur, 3) ? 'active' : ''}
        />
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(4)}
            icon={<SettingOutlined />}
            className={eq(cur, 4) ? 'active' : ''}
          />
        </Badge>
        <Button
          type='text'
          size='large'
          icon={<LogoutOutlined />}
          className='logout'
          onClick={handleLogout}
        />
      </Space>
    </>
  );
}

export default memo(SiderToolsBar);
