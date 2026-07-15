import { writeFile } from 'node:fs/promises';

import packageJson from '../../package.json' with { type: 'json' };
import { deriveChannel, normalizeImageTagPart, resolveReleaseVersion } from './shared.mjs';

async function main() {
  const environment = process.env.AMI_RELEASE_ENVIRONMENT?.trim() || 'beta';
  const product = process.env.AMI_RELEASE_PRODUCT || 'lobehub-ami';
  const timestamp =
    process.env.AMI_RELEASE_TIMESTAMP ||
    new Intl.DateTimeFormat('sv-SE', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
    })
      .format(new Date())
      .replaceAll(/[-: ]/g, '');
  const version =
    environment === 'beta'
      ? `${product}-beta-${timestamp}`
      : resolveReleaseVersion({ env: process.env, packageVersion: packageJson.version });
  const channel = deriveChannel({ channel: process.env.AMI_RELEASE_CHANNEL, version });
  if (environment === 'production' && !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
    throw new Error('Production version must match semver X.Y.Z');
  }
  const imageRepository =
    process.env.AMI_IMAGE_REPOSITORY || 'ghcr.io/lobehub-enterprise/lobehub-ami';
  const imageTag = normalizeImageTagPart(version);
  const imageRef = `${imageRepository}:${imageTag}`;

  await appendGitHubEnv({
    AMI_ARTIFACT_KIND: 'container_image',
    AMI_ARTIFACT_LOCATOR: imageRef,
    AMI_ARTIFACT_NAME: imageTag,
    AMI_IMAGE_REF: imageRef,
    AMI_IMAGE_REPOSITORY: imageRepository,
    AMI_IMAGE_TAG: imageTag,
    AMI_RELEASE_CHANNEL: channel,
    AMI_RELEASE_ENVIRONMENT: environment,
    AMI_RELEASE_PRODUCT: product,
    AMI_RELEASE_VERSION: version,
    AMI_STORAGE_PROVIDER: 'oci_registry',
  });

  console.log(`AMI image: ${imageRef}`);
}

async function appendGitHubEnv(values: Record<string, string>) {
  if (!process.env.GITHUB_ENV) return;

  const content = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await writeFile(process.env.GITHUB_ENV, `${content}\n`, { flag: 'a' });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
