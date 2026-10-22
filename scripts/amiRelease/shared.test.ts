import { describe, expect, it } from 'vitest';

import {
  buildAmiArtifactPayload,
  buildAssetName,
  buildConsoleArtifactUrl,
  buildImageTag,
  deriveChannel,
  normalizeChannel,
  normalizeImageTagPart,
  resolveReleaseVersion,
} from './shared.mjs';

describe('amiRelease shared helpers', () => {
  it('derives release channels from unified AMI versions', () => {
    expect(deriveChannel({ version: 'lobehub-ami-beta-202605021405' })).toBe('beta');
    expect(deriveChannel({ version: '2.1.0' })).toBe('production');
  });

  it('rejects unsupported release channels', () => {
    expect(() => normalizeChannel('stable')).toThrow('Invalid AMI release channel');
  });

  it('normalizes release versions from env or package version', () => {
    expect(
      resolveReleaseVersion({ env: { AMI_RELEASE_VERSION: '2.1.0' }, packageVersion: '2.0.0' }),
    ).toBe('2.1.0');
    expect(resolveReleaseVersion({ env: {}, packageVersion: '2.0.0' })).toBe('2.0.0');
  });

  it('builds deterministic artifact names and console registration urls', () => {
    expect(
      buildAssetName({
        arch: 'x64',
        channel: 'beta',
        platform: 'linux',
        product: 'lobehub-ami',
        version: 'lobehub-ami-beta-202605021405',
      }),
    ).toBe('lobehub-ami-beta-202605021405-linux-x64.tar.gz');

    expect(buildConsoleArtifactUrl('https://console.example.com/base/', 'lobehub')).toBe(
      'https://console.example.com/api/v1/products/lobehub/artifacts',
    );
  });

  it('builds deterministic image tags from date, environment, and channel', () => {
    expect(buildImageTag({ channel: 'production', date: '20260502', environment: 'beta' })).toBe(
      '20260502-beta-production',
    );
    expect(buildImageTag({ channel: 'beta', date: '2026/05/02', environment: 'QA Env' })).toBe(
      '2026-05-02-qa-env-beta',
    );
    expect(() => normalizeImageTagPart('   ')).toThrow('Invalid AMI image tag part');
  });

  it('builds a console artifact payload with console-supported aliases', () => {
    const payload = buildAmiArtifactPayload({
      arch: 'x64',
      assetName: 'lobehub-ami-2.1.0-linux-x64.tar.gz',
      channel: 'production',
      digest: 'sha256:abc',
      environment: 'production',
      locator: 'https://example.com/asset.tar.gz',
      platform: 'linux',
      releaseUrl: 'https://example.com/release',
      sourceCommitSha: 'sha',
      sourceRef: 'refs/tags/v2.1.0',
      version: '2.1.0',
      workflowRunId: '1',
    });

    expect(payload).toMatchObject({
      aliases: [
        { alias: '2.1.0', aliasType: 'release_version' },
        { alias: 'production', aliasType: 'alias' },
        { alias: 'production', aliasType: 'retag' },
      ],
      artifactKind: 'next_standalone',
      metadataSnapshot: {
        entry: 'server.js',
        environment: 'production',
        releaseChannel: 'production',
      },
      releaseChannel: 'production',
      releaseVersion: '2.1.0',
      storageProvider: 'github_release',
      changelog: {
        content: 'Release 2.1.0 artifact https://example.com/asset.tar.gz.',
        summary: 'Release 2.1.0',
      },
    });
    expect(payload).not.toHaveProperty('tag');
    expect(payload).not.toHaveProperty('version');
    expect(payload).not.toHaveProperty('tags');
  });

  it('builds a console artifact payload for GHCR container images', () => {
    const payload = buildAmiArtifactPayload({
      arch: 'x64',
      assetName: 'lobehub-ami-beta-202605021405',
      channel: 'beta',
      digest: 'sha256:abc',
      environment: 'beta',
      locator: 'ghcr.io/lobehub-enterprise/lobehub-ami:lobehub-ami-beta-202605021405',
      platform: 'linux',
      storageProvider: 'oci_registry',
      version: 'lobehub-ami-beta-202605021405',
    });

    expect(payload).toMatchObject({
      artifactKind: 'container_image',
      locator: 'ghcr.io/lobehub-enterprise/lobehub-ami:lobehub-ami-beta-202605021405',
      releaseChannel: 'beta',
      releaseVersion: 'lobehub-ami-beta-202605021405',
      metadataSnapshot: {
        imageRef: 'ghcr.io/lobehub-enterprise/lobehub-ami:lobehub-ami-beta-202605021405',
        imageTag: 'lobehub-ami-beta-202605021405',
      },
      storageProvider: 'oci_registry',
      aliases: [
        { alias: 'lobehub-ami-beta-202605021405', aliasType: 'release_version' },
        { alias: 'beta', aliasType: 'alias' },
        { alias: 'lobehub-ami-beta-202605021405', aliasType: 'retag' },
      ],
    });
    expect(payload).not.toHaveProperty('tag');
    expect(payload).not.toHaveProperty('version');
    expect(payload).not.toHaveProperty('tags');
    expect(payload).not.toHaveProperty('changelog');
  });
});
