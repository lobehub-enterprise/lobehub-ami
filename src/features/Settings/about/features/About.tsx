'use client';

import { BRANDING_NAME } from '@lobechat/business-const';
import { Flexbox } from '@lobehub/ui';
import { Divider } from '@lobehub/ui/base-ui';
import { Form } from '@lobehub/ui/base-ui/form';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import BrandWatermark from '@/components/BrandWatermark';

import Version from './Version';

const About = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('common');

  return (
    <Form.Group
      collapsible={false}
      style={{ maxWidth: '1024px', width: '100%' }}
      title={`${t('about')} ${BRANDING_NAME}`}
      variant={'filled'}
    >
      <Flexbox gap={20} paddingBlock={20} width={'100%'}>
        <Version mobile={mobile} />
        <Divider style={{ marginBlock: 0 }} />
        <BrandWatermark />
      </Flexbox>
    </Form.Group>
  );
});

export default About;
