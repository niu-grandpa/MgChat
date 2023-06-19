import Avatar from '@/components/Avatar';
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
import { eq } from 'lodash-es';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  icon: string;
  status: UserStatus;
  onChange: (tab: number) => void;
};

function OptionBar({ icon, status, onChange }: Props) {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);

  const path = useRef([
    '/user/message',
    '/user/friends',
    '/user/group',
    '/user/find',
    '/user/settings',
  ]);
  const statusType = useRef<Record<number, BadgeProps['status']>>({
    1: 'success',
    2: 'processing',
    3: 'error',
    4: 'default',
    5: 'warning',
  });

  const handleClick = useCallback(
    (idx: number) => {
      setIndex(idx);
      onChange(idx);
      navigate(path.current[idx]);
    },
    [onChange, path]
  );

  const handleLogout = useCallback(() => {
    //
  }, []);

  useEffect(() => {
    handleClick(0);
  }, []);

  return (
    <>
      <div>
        <Avatar size={36} />
        <Badge
          status={statusType.current[status]}
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
            className={eq(index, 0) ? 'active' : ''}
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
          className={eq(index, 3) ? 'active' : ''}
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
          onClick={handleLogout}
        />
      </Space>
    </>
  );
}

export default memo(OptionBar);
