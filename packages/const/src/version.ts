import {
  BRANDING_LOGO_DARK_URL,
  BRANDING_LOGO_LIGHT_URL,
  BRANDING_LOGO_URL,
  BRANDING_NAME,
  ORG_NAME,
} from '@lobechat/business-const';

import pkg from '../../../package.json';
// type-only: loads ./global.d.ts so `__ELECTRON__` exists even when this
// package is compiled from a workspace without the app's ambient declarations
import type {} from './global';

export const CURRENT_VERSION = pkg.version;

export const isDesktop = typeof __ELECTRON__ !== 'undefined' && !!__ELECTRON__;

// @ts-ignore
export const isCustomBranding =
  BRANDING_NAME !== 'LobeHub' ||
  !!BRANDING_LOGO_URL ||
  !!BRANDING_LOGO_DARK_URL ||
  !!BRANDING_LOGO_LIGHT_URL;
// @ts-ignore
export const isCustomORG = ORG_NAME !== 'LobeHub';
