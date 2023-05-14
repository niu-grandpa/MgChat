import { Spin } from '@arco-design/web-react';
import { memo } from 'react';
import { DynamicImport } from 'react-router-middleware-plus';

function Lazy(props: { comp: () => Promise<any> }) {
  return <DynamicImport loading={<Spin dot />} element={props.comp} />;
}

export default memo(Lazy);
