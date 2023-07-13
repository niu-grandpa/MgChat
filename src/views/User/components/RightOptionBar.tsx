import Avatar from '@/components/Avatar';
import { useUserStore } from '@/model';
import { UserStatus } from '@/services/enum';
import {
  CommentOutlined,
  LogoutOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupDeleteOutlined,
} from '@ant-design/icons';
import { Badge, BadgeProps, Button, Space } from 'antd';
import { ipcRenderer } from 'electron';
import { eq } from 'lodash-es';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  icon?: string;
  status?: UserStatus;
  onLogout: () => void;
  onChange?: (tab: number) => void;
};

const path = [
  '/user/message',
  '/user/friends',
  '/user/group',
  '/find',
  '/user/settings',
];
const statusType: Record<number, BadgeProps['status']> = {
  1: 'success',
  2: 'processing',
  3: 'error',
  4: 'default',
  5: 'warning',
};

function OptionBar({ icon, status, onLogout, onChange }: Props) {
  const navigate = useNavigate();

  const { data } = useUserStore(state => ({ data: state.data }));

  const findPageParams = useRef({
    uid: data?.uid,
    nickname: data?.nickname,
  });

  const [index, setIndex] = useState(0);

  const toFindPage = useCallback((pathname: string) => {
    ipcRenderer.send('open-win', {
      center: true,
      useCache: false,
      width: 720,
      height: 567,
      pathname: `${pathname}/${JSON.stringify(findPageParams.current)}`,
    });
  }, []);

  const handleClick = useCallback(
    (idx: number) => {
      const pathname = path[idx];
      // 好友搜索页
      if (idx === 3) {
        toFindPage(pathname);
      } else {
        navigate(pathname);
        setIndex(idx);
      }
      onChange?.(idx);
    },
    [onChange, navigate, toFindPage]
  );

  useEffect(() => {
    handleClick(0);
  }, []);

  return (
    <>
      <div>
        <Avatar size={36} icon={icon} />
        <Badge
          status={statusType[status || UserStatus.ONLINE]}
          className='user-siderbar-status'
        />
      </div>
      <Space wrap direction='vertical' className='user-siderbar-space'>
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(0)}
            icon={<CommentOutlined />}
            className={index === 0 ? 'active' : ''}
          />
        </Badge>
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(1)}
            icon={<UserOutlined />}
            className={eq(index, 1) ? 'active' : ''}
          />
        </Badge>
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(2)}
            icon={<UsergroupDeleteOutlined />}
            className={eq(index, 2) ? 'active' : ''}
          />
        </Badge>
        <Button
          type='text'
          size='large'
          onClick={() => handleClick(3)}
          icon={<PlusOutlined />}
        />
        <Badge count={0} dot offset={[-10, 10]}>
          <Button
            type='text'
            size='large'
            onClick={() => handleClick(4)}
            icon={<SettingOutlined />}
            className={eq(index, 4) ? 'active' : ''}
          />
        </Badge>
        <Button
          type='text'
          size='large'
          icon={<LogoutOutlined />}
          className='logout'
          onClick={onLogout}
        />
      </Space>
    </>
  );
}

export default memo(OptionBar);
