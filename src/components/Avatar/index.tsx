import defaultAvatar from '@/assets/icons/avatar.png';
import { Avatar, AvatarProps } from '@arco-design/web-react';
import { memo } from 'react';

function UAvatar(props: { icon?: string } & AvatarProps) {
  const { icon, size, className, onClick } = props;
  return (
    <Avatar style={{ background: '#fff' }} {...{ size, className, onClick }}>
      <img
        src={icon || defaultAvatar}
        style={{ objectFit: 'cover' }}
        alt='avatar'
      />
    </Avatar>
  );
}

export default memo(UAvatar);
