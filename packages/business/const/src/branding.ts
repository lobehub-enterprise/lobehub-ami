// the code below can only be modified with commercial license
// if you want to use it in the commercial usage
// please contact us for more information: hello@lobehub.com

export interface RuntimeBrandingConfig {
  defaultAvatarUrl?: string;
  lobeAiAvatarUrl?: string;
  lobeAiName?: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  logoUrl?: string;
  name?: string;
  orgName?: string;
}

const getEnv = (key: string) => {
  if (typeof process === 'undefined') return undefined;

  return process.env[key];
};

const getRuntimeBrandingConfig = (): RuntimeBrandingConfig => {
  if (typeof window === 'undefined') return {};

  return window.__SERVER_CONFIG__?.clientEnv.branding || {};
};

const getBrandingValue = (key: keyof RuntimeBrandingConfig, envKey: string, fallback: string) => {
  const value = getRuntimeBrandingConfig()[key] || getEnv(envKey);

  return value || fallback;
};

export const LOBE_CHAT_CLOUD = 'LobeHub Cloud';

export const BRANDING_NAME = getBrandingValue('name', 'BRANDING_NAME', 'LobeHub');
export const BRANDING_LOGO_URL = getBrandingValue('logoUrl', 'BRANDING_LOGO_URL', '');
export const BRANDING_LOGO_DARK_URL = getBrandingValue('logoDarkUrl', 'BRANDING_LOGO_DARK_URL', '');
export const BRANDING_LOGO_LIGHT_URL = getBrandingValue(
  'logoLightUrl',
  'BRANDING_LOGO_LIGHT_URL',
  '',
);
export const BRANDING_DEFAULT_AVATAR_URL = getBrandingValue(
  'defaultAvatarUrl',
  'BRANDING_DEFAULT_AVATAR_URL',
  '',
);
export const BRANDING_LOBE_AI_NAME = getBrandingValue(
  'lobeAiName',
  'BRANDING_LOBE_AI_NAME',
  'Lobe AI',
);
export const BRANDING_LOBE_AI_AVATAR_URL = getBrandingValue(
  'lobeAiAvatarUrl',
  'BRANDING_LOBE_AI_AVATAR_URL',
  '',
);

export const ORG_NAME = getBrandingValue('orgName', 'BRANDING_ORG_NAME', 'LobeHub');

export const BRANDING_URL = {
  help: undefined,
  privacy: undefined,
  subscription: 'https://app.lobehub.com/settings/plans',
  support: undefined,
  terms: undefined,
};

export const SOCIAL_URL = {
  discord: 'https://discord.gg/AYFPHvv2jT',
  github: 'https://github.com/lobehub',
  medium: 'https://medium.com/@lobehub',
  x: 'https://x.com/lobehub',
  youtube: 'https://www.youtube.com/@lobehub',
};

export const FILE_URL = {
  importFromNotionGuide: 'https://hub-apac-1.lobeobjects.space/assets/notion.mp4',
};

export const BRANDING_EMAIL = {
  business: 'hello@lobehub.com',
  support: 'support@lobehub.com',
};

export const BRANDING_PROVIDER = 'lobehub';

export const COPYRIGHT = `© ${new Date().getFullYear()} ${ORG_NAME}`;
export const COPYRIGHT_FULL = `${COPYRIGHT}. All rights reserved.`;
