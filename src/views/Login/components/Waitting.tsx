import { Drawer, DrawerProps } from 'antd';

function Waitting(props: DrawerProps) {
  return (
    <Drawer className='login-waitting' {...props} closable={false} width='100%'>
      <section className='login-waitting-preview'>
        <div className='sk-chase'>
          <div className='sk-chase-dot' />
          <div className='sk-chase-dot' />
          <div className='sk-chase-dot' />
          <div className='sk-chase-dot' />
          <div className='sk-chase-dot' />
          <div className='sk-chase-dot' />
        </div>
        <p style={{ margin: 24 }}>正在登陆中...</p>
      </section>
    </Drawer>
  );
}

export default Waitting;
