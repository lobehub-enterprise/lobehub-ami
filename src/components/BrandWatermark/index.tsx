'use client';

import { type FlexboxProps } from '@lobehub/ui';
import { cssVar, Flexbox } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { memo } from 'react';

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  return (
    <Flexbox
      horizontal
      align={'center'}
      dir={'ltr'}
      flex={'none'}
      gap={4}
      style={{ color: cssVar.colorTextDescription, fontSize: 12, ...style }}
      {...rest}
    >
      <span>Powered by</span>
      <LobeHub size={20} type={'text'} />
    </Flexbox>
  );
});

export default BrandWatermark;
