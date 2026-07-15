import { OG_URL } from '@lobechat/const';

import { getServerFeatureFlagsValue } from '@/config/featureFlags';
import { OFFICIAL_URL } from '@/const/url';
import { isCustomORG, isDesktop } from '@/const/version';
import { analyticsEnv } from '@/envs/analytics';
import { appEnv } from '@/envs/app';
import { brandingEnv } from '@/envs/branding';
import { fileEnv } from '@/envs/file';
import { pythonEnv } from '@/envs/python';
import { type Locales } from '@/locales/resources';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { buildAnalyticsConfig, fetchViteDevTemplate, renderSpaHtml } from '@/server/spaHtml';
import { translation } from '@/server/translation';
import { type SPAClientEnv, type SPAServerConfig } from '@/types/spaServerConfig';
import { RouteVariants } from '@/utils/server/routeVariants';

export function generateStaticParams() {
  const mobileOptions = isDesktop ? [false] : [true, false];
  const staticLocales: Locales[] = ['en-US', 'zh-CN'];

  const variants: { variants: string }[] = [];

  for (const locale of staticLocales) {
    for (const isMobile of mobileOptions) {
      variants.push({
        variants: RouteVariants.serializeVariants({ isMobile, locale }),
      });
    }
  }

  return variants;
}

const isDev = process.env.NODE_ENV === 'development';

async function getTemplate(isMobile: boolean): Promise<string> {
  if (isDev) return fetchViteDevTemplate();

  const { desktopHtmlTemplate, mobileHtmlTemplate } = await import('./spaHtmlTemplates');

  return isMobile ? mobileHtmlTemplate : desktopHtmlTemplate;
}

function buildClientEnv(): SPAClientEnv {
  return {
    branding: {
      defaultAvatarUrl: brandingEnv.BRANDING_DEFAULT_AVATAR_URL,
      lobeAiAvatarUrl: brandingEnv.BRANDING_LOBE_AI_AVATAR_URL,
      lobeAiName: brandingEnv.BRANDING_LOBE_AI_NAME,
      logoDarkUrl: brandingEnv.BRANDING_LOGO_DARK_URL,
      logoLightUrl: brandingEnv.BRANDING_LOGO_LIGHT_URL,
      logoUrl: brandingEnv.BRANDING_LOGO_URL,
      name: brandingEnv.BRANDING_NAME,
      orgName: brandingEnv.BRANDING_ORG_NAME,
    },
    marketBaseUrl: appEnv.MARKET_BASE_URL,
    pyodideIndexUrl: pythonEnv.NEXT_PUBLIC_PYODIDE_INDEX_URL,
    pyodidePipIndexUrl: pythonEnv.NEXT_PUBLIC_PYODIDE_PIP_INDEX_URL,
    s3FilePath: fileEnv.NEXT_PUBLIC_S3_FILE_PATH,
  };
}

async function buildSeoMeta(locale: string): Promise<string> {
  const { t } = await translation('metadata', locale);
  const title = t('chat.title', { appName: brandingEnv.BRANDING_NAME });
  const description = t('chat.description', { appName: brandingEnv.BRANDING_NAME });

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${OFFICIAL_URL}" />`,
    `<meta property="og:image" content="${OG_URL}" />`,
    `<meta property="og:site_name" content="${brandingEnv.BRANDING_NAME}" />`,
    `<meta property="og:locale" content="${locale}" />`,
  ].join('\n    ');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[]; variants: string }> },
) {
  const { variants } = await params;
  const { locale, isMobile } = RouteVariants.deserializeVariants(variants);

  const spaConfig: SPAServerConfig = {
    analyticsConfig: buildAnalyticsConfig({ desktop: true }),
    clientEnv: buildClientEnv(),
    config: await getServerGlobalConfig(),
    featureFlags: getServerFeatureFlagsValue(),
    isMobile,
  };

  const template = await getTemplate(isMobile);
  const seoMeta = await buildSeoMeta(locale);

  return renderSpaHtml(template, { seoMeta, serverConfig: spaConfig });
}
