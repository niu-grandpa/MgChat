import { Spin } from '@arco-design/web-react';
import { Suspense, lazy, memo } from 'react';

function Lazy(props: { comp: () => Promise<any> }) {
  const Component = lazy(props.comp);
  return (
    <Suspense fallback={<Spin dot />}>
      <Component />
    </Suspense>
  );
}

export default memo(Lazy);
