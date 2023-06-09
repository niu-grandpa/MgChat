import defaultAvatar from '@/assets/icons/avatar.jpg';
import { Avatar, AvatarProps } from 'antd';
import { memo } from 'react';

function MyAvatar(props: { icon?: string } & AvatarProps) {
  const { icon, ...rest } = props;
  return (
    <Avatar
      {...rest}
      src={icon || defaultAvatar}
      style={{ backgroundColor: '#fff', userSelect: 'none' }}
    />
  );
}

export default memo(MyAvatar);
