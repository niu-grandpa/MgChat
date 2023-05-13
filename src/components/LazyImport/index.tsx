import { Spin } from '@arco-design/web-react';
import { memo } from 'react';
import { DynamicImport } from 'react-router-middleware-plus';

function Lazy(props: { path: string }) {
  return (
    <DynamicImport loading={<Spin dot />} element={() => import(props.path)} />
  );
}

export default memo(Lazy);
