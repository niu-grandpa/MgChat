import { Spin } from '@arco-design/web-react';
import { Suspense, lazy, memo } from 'react';

function Lazy(props: { comp: () => Promise<any> }) {
  const Component = lazy(props.comp);
  return (
    <Suspense
      fallback={
        <Spin size={40} loading style={{ display: 'block' }}>
          <section style={{ width: '100vw', height: '100vh' }} />
        </Spin>
      }>
      <Component />
    </Suspense>
  );
}

export default memo(Lazy);
