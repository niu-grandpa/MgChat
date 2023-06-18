import { Suspense, lazy, memo } from 'react';

import './index.scss';

function Lazy(props: { comp: () => Promise<any> }) {
  const Component = lazy(props.comp);
  return (
    <Suspense
      fallback={
        <section className='preview-area'>
          <ul className='sk-cube-grid'>
            <li className='sk-cube sk-cube1' />
            <li className='sk-cube sk-cube2' />
            <li className='sk-cube sk-cube3' />
            <li className='sk-cube sk-cube4' />
            <li className='sk-cube sk-cube5' />
            <li className='sk-cube sk-cube6' />
            <li className='sk-cube sk-cube7' />
            <li className='sk-cube sk-cube8' />
            <li className='sk-cube sk-cube9' />
          </ul>
        </section>
      }>
      <Component />
    </Suspense>
  );
}

export default memo(Lazy);
