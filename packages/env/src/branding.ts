import {
  BRANDING_DEFAULT_AVATAR_URL as DEFAULT_BRANDING_DEFAULT_AVATAR_URL,
  BRANDING_LOBE_AI_AVATAR_URL as DEFAULT_BRANDING_LOBE_AI_AVATAR_URL,
  BRANDING_LOBE_AI_NAME as DEFAULT_BRANDING_LOBE_AI_NAME,
  BRANDING_LOGO_DARK_URL as DEFAULT_BRANDING_LOGO_DARK_URL,
  BRANDING_LOGO_LIGHT_URL as DEFAULT_BRANDING_LOGO_LIGHT_URL,
  BRANDING_LOGO_URL as DEFAULT_BRANDING_LOGO_URL,
  BRANDING_NAME as DEFAULT_BRANDING_NAME,
  ORG_NAME as DEFAULT_BRANDING_ORG_NAME,
} from '@lobechat/business-const';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BRANDING_DEFAULT_AVATAR_URL?: string;
      BRANDING_LOBE_AI_AVATAR_URL?: string;
      BRANDING_LOBE_AI_NAME?: string;
      BRANDING_LOGO_DARK_URL?: string;
      BRANDING_LOGO_LIGHT_URL?: string;
      BRANDING_LOGO_URL?: string;
      BRANDING_NAME?: string;
      BRANDING_ORG_NAME?: string;
    }
  }
}

export const getBrandingConfig = () => {
  return createEnv({
    clientPrefix: 'NEXT_PUBLIC_',
    client: {},
    runtimeEnv: {
      BRANDING_DEFAULT_AVATAR_URL:
        process.env.BRANDING_DEFAULT_AVATAR_URL || DEFAULT_BRANDING_DEFAULT_AVATAR_URL,
      BRANDING_LOBE_AI_AVATAR_URL:
        process.env.BRANDING_LOBE_AI_AVATAR_URL || DEFAULT_BRANDING_LOBE_AI_AVATAR_URL,
      BRANDING_LOBE_AI_NAME: process.env.BRANDING_LOBE_AI_NAME || DEFAULT_BRANDING_LOBE_AI_NAME,
      BRANDING_LOGO_DARK_URL: process.env.BRANDING_LOGO_DARK_URL || DEFAULT_BRANDING_LOGO_DARK_URL,
      BRANDING_LOGO_LIGHT_URL:
        process.env.BRANDING_LOGO_LIGHT_URL || DEFAULT_BRANDING_LOGO_LIGHT_URL,
      BRANDING_LOGO_URL: process.env.BRANDING_LOGO_URL || DEFAULT_BRANDING_LOGO_URL,
      BRANDING_NAME: process.env.BRANDING_NAME || DEFAULT_BRANDING_NAME,
      BRANDING_ORG_NAME: process.env.BRANDING_ORG_NAME || DEFAULT_BRANDING_ORG_NAME,
    },
    server: {
      BRANDING_DEFAULT_AVATAR_URL: z.string(),
      BRANDING_LOBE_AI_AVATAR_URL: z.string(),
      BRANDING_LOBE_AI_NAME: z.string(),
      BRANDING_LOGO_DARK_URL: z.string(),
      BRANDING_LOGO_LIGHT_URL: z.string(),
      BRANDING_LOGO_URL: z.string(),
      BRANDING_NAME: z.string(),
      BRANDING_ORG_NAME: z.string(),
    },
  });
};

export const brandingEnv = getBrandingConfig();
