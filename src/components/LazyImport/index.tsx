import { Spin } from 'antd';
import { Suspense, lazy, memo } from 'react';

function Lazy(props: { comp: () => Promise<any> }) {
  const Component = lazy(props.comp);
  return (
    <Suspense
      fallback={
        <Spin delay={50} spinning size='large'>
          <section style={{ width: '100vw', height: '100vh' }} />
        </Spin>
      }>
      <Component />
    </Suspense>
  );
}

export default memo(Lazy);
