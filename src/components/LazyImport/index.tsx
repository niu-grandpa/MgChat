import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { Suspense, lazy, memo } from 'react';

function Lazy(props: { comp: () => Promise<any> }) {
  const Component = lazy(props.comp);
  return (
    <Suspense
      fallback={
        <Spin
          spinning
          size='large'
          indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}>
          <section style={{ width: '100vw', height: '100vh' }} />
        </Spin>
      }>
      <Component />
    </Suspense>
  );
}

export default memo(Lazy);
