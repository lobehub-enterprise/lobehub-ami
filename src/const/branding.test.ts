import { afterEach, describe, expect, it, vi } from 'vitest';

const envKeys = [
  'BRANDING_NAME',
  'BRANDING_ORG_NAME',
  'BRANDING_LOGO_URL',
  'BRANDING_LOGO_DARK_URL',
  'BRANDING_LOGO_LIGHT_URL',
  'BRANDING_DEFAULT_AVATAR_URL',
  'BRANDING_LOBE_AI_NAME',
  'BRANDING_LOBE_AI_AVATAR_URL',
];

afterEach(() => {
  for (const key of envKeys) {
    delete process.env[key];
  }

  vi.resetModules();
  window.__SERVER_CONFIG__ = undefined;
});

describe('branding runtime configuration', () => {
  it('should read product branding from environment variables', async () => {
    process.env.BRANDING_NAME = 'Acme Hub';
    process.env.BRANDING_ORG_NAME = 'Acme';
    process.env.BRANDING_LOGO_URL = '/custom/logo.png';
    process.env.BRANDING_LOBE_AI_NAME = 'Acme AI';

    vi.resetModules();

    const { BRANDING_LOGO_URL, BRANDING_NAME, BRANDING_LOBE_AI_NAME, ORG_NAME } =
      await import('@lobechat/business-const');

    expect(BRANDING_NAME).toBe('Acme Hub');
    expect(ORG_NAME).toBe('Acme');
    expect(BRANDING_LOGO_URL).toBe('/custom/logo.png');
    expect(BRANDING_LOBE_AI_NAME).toBe('Acme AI');
  });

  it('should read default avatar assets from environment variables', async () => {
    process.env.BRANDING_DEFAULT_AVATAR_URL = '/custom/default-agent.png';
    process.env.BRANDING_LOBE_AI_AVATAR_URL = '/custom/acme-ai.png';

    vi.resetModules();

    const { DEFAULT_AVATAR, DEFAULT_INBOX_AVATAR } = await import('@lobechat/const');

    expect(DEFAULT_AVATAR).toBe('/custom/default-agent.png');
    expect(DEFAULT_INBOX_AVATAR).toBe('/custom/acme-ai.png');
  });

  it('should prefer runtime SPA branding config over process environment variables', async () => {
    process.env.BRANDING_NAME = 'Env Hub';
    process.env.BRANDING_LOGO_URL = '/env/logo.png';
    window.__SERVER_CONFIG__ = {
      clientEnv: {
        branding: {
          logoUrl: '/runtime/logo.png',
          name: 'Runtime Hub',
        },
      },
    } as Window['__SERVER_CONFIG__'];

    vi.resetModules();

    const { BRANDING_LOGO_URL, BRANDING_NAME } = await import('@lobechat/business-const');

    expect(BRANDING_NAME).toBe('Runtime Hub');
    expect(BRANDING_LOGO_URL).toBe('/runtime/logo.png');
  });

  it('should enable custom branding when only a custom logo is configured', async () => {
    process.env.BRANDING_LOGO_URL = '/custom/logo.png';

    vi.resetModules();

    const { isCustomBranding } = await import('@/const/version');

    expect(isCustomBranding).toBe(true);
  });
});
