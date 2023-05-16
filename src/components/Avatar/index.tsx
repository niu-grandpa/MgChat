import { Avatar, AvatarProps } from '@arco-design/web-react';
import { memo } from 'react';

function UAvatar(props: { icon: string } & AvatarProps) {
  const { icon, size, className, onClick } = props;
  return (
    <Avatar {...{ size, className, onClick }}>
      <img src={icon} style={{ objectFit: 'cover' }} alt='avatar' />
    </Avatar>
  );
}

export default memo(UAvatar);
