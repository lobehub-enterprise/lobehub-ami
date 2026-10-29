export const AMI_RELEASE_CHANNELS = ['beta', 'production'] as const;

export type AmiReleaseChannel = (typeof AMI_RELEASE_CHANNELS)[number];
export type EnvRecord = Record<string, string | undefined>;

export interface AmiArtifactChangelogPayload {
  content: string;
  summary: string;
}

export interface AmiArtifactPayload {
  aliases: Array<{ alias: string; aliasType: string }>;
  arch: string;
  artifactKind: string;
  changelog?: AmiArtifactChangelogPayload;
  digest: string;
  locator: string;
  metadataSnapshot: {
    assetName: string;
    entry: string;
    environment: string;
    imageRef?: string;
    imageTag?: string;
    releaseChannel: AmiReleaseChannel;
    releaseUrl?: string;
  };
  platform: string;
  releaseChannel: AmiReleaseChannel;
  releaseVersion: string;
  sourceCommitSha?: string;
  sourceRef?: string;
  storageProvider: string;
  workflowRunId?: string;
}

export interface AmiArtifactPayloadConfig {
  arch: string;
  assetName: string;
  channel: AmiReleaseChannel;
  digest: string;
  environment: string;
  locator: string;
  platform: string;
  releaseUrl?: string;
  sourceCommitSha?: string;
  sourceRef?: string;
  storageProvider?: string;
  version: string;
  workflowRunId?: string;
}

export function buildAmiArtifactPayload(config: AmiArtifactPayloadConfig): AmiArtifactPayload {
  const payload: AmiArtifactPayload = {
    aliases: [
      { alias: config.version, aliasType: 'release_version' },
      { alias: config.channel, aliasType: 'alias' },
      {
        alias: config.storageProvider === 'oci_registry' ? config.assetName : config.environment,
        aliasType: 'retag',
      },
    ],
    arch: config.arch,
    artifactKind: config.storageProvider === 'oci_registry' ? 'container_image' : 'next_standalone',
    digest: config.digest,
    locator: config.locator,
    metadataSnapshot: {
      assetName: config.assetName,
      entry: config.storageProvider === 'oci_registry' ? config.locator : 'server.js',
      environment: config.environment,
      releaseChannel: config.channel,
      ...(config.storageProvider === 'oci_registry'
        ? { imageRef: config.locator, imageTag: config.assetName }
        : {}),
      ...(config.releaseUrl ? { releaseUrl: config.releaseUrl } : {}),
    },
    platform: config.platform,
    releaseChannel: config.channel,
    releaseVersion: config.version,
    ...(config.sourceCommitSha ? { sourceCommitSha: config.sourceCommitSha } : {}),
    ...(config.sourceRef ? { sourceRef: config.sourceRef } : {}),
    storageProvider: config.storageProvider || 'github_release',
    ...(config.workflowRunId ? { workflowRunId: config.workflowRunId } : {}),
  };

  if (config.channel === 'production') {
    payload.changelog = {
      content: `Release ${config.version} artifact ${config.locator}.`,
      summary: `Release ${config.version}`,
    };
  }

  return payload;
}

export function buildAssetName(input: {
  arch: string;
  channel: AmiReleaseChannel;
  platform: string;
  product: string;
  version: string;
}) {
  if (input.version.startsWith(`${input.product}-`)) {
    return `${input.version}-${input.platform}-${input.arch}.tar.gz`;
  }

  return `${input.product}-${input.version}-${input.platform}-${input.arch}.tar.gz`;
}

export function buildConsoleArtifactUrl(endpoint: string, product: string) {
  const baseUrl = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  return new URL(`/api/v1/products/${product}/artifacts`, baseUrl).toString();
}

export function buildImageTag(input: {
  channel: AmiReleaseChannel;
  date: string;
  environment: string;
}) {
  return `${normalizeImageTagPart(input.date)}-${normalizeImageTagPart(input.environment)}-${input.channel}`;
}

export function normalizeImageTagPart(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9_.-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

  if (!normalized) throw new Error(`Invalid AMI image tag part: ${value}`);

  return normalized;
}

export function deriveChannel(input: { channel?: string; version: string }): AmiReleaseChannel {
  if (input.channel) return normalizeChannel(input.channel);

  if (input.version.includes('-beta-')) return 'beta';

  return 'production';
}

export function normalizeChannel(channel: string): AmiReleaseChannel {
  if (AMI_RELEASE_CHANNELS.includes(channel as AmiReleaseChannel)) {
    return channel as AmiReleaseChannel;
  }

  throw new Error(`Invalid AMI release channel: ${channel}. Expected beta or production.`);
}

export function requireEnvValue(env: EnvRecord, name: string) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);

  return value;
}

export function resolveReleaseVersion(input: { env: EnvRecord; packageVersion: string }) {
  const version = input.env.AMI_RELEASE_VERSION || input.env.GITHUB_REF_NAME;
  if (version) return version;

  return input.packageVersion;
}
