import Avatar from '@/components/Avatar';
import { Drawer, DrawerProps } from 'antd';

function Waitting(props: DrawerProps) {
  return (
    <Drawer className='login-waitting' {...props} closable={false} width='100%'>
      <div className='login-waitting-content'>
        <Avatar size={56} />
        <p>正在登录中...</p>
      </div>
    </Drawer>
  );
}

export default Waitting;
