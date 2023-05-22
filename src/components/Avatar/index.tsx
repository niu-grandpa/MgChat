import defaultAvatar from '@/assets/icons/avatar.png';
import { Avatar, AvatarProps } from 'antd';
import { memo } from 'react';

function UAvatar(props: { icon?: string } & AvatarProps) {
  const { icon, ...rest } = props;
  return (
    <Avatar
      {...rest}
      src={icon || defaultAvatar}
      style={{ backgroundColor: '#fff', userSelect: 'none' }}
    />
  );
}

export default memo(UAvatar);
