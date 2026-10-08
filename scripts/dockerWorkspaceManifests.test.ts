import { spawnSync } from 'node:child_process';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const dockerfile = readFileSync(path.resolve(import.meta.dirname, '../Dockerfile'), 'utf8');

describe('Docker workspace manifests', () => {
  it('copies the Workbench package manifest before pnpm i', () => {
    const copyIdx = dockerfile.indexOf('COPY apps/workbench/package.json');
    const installIdx = dockerfile.search(/\n\s+pnpm (?:i|install)\s/);

    expect(copyIdx).toBeGreaterThan(-1);
    expect(installIdx).toBeGreaterThan(-1);
    expect(copyIdx).toBeLessThan(installIdx);
  });

  it('accepts the runtime dependency install arguments with the project pnpm version', () => {
    const args = dockerfile.match(/^\s+pnpm add ([^&\r\n]+)/m)?.[1]?.trim();
    expect(args).toBeDefined();

    const result = spawnSync('pnpm', ['add', ...args!.split(/\s+/), '--help'], {
      encoding: 'utf8',
      timeout: 15_000,
    });

    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });

  it('keeps the installed dependency layout when running the next pnpm command', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'docker-pnpm-layout-'));
    const packageManager = JSON.parse(
      readFileSync(path.resolve(import.meta.dirname, '../package.json'), 'utf8'),
    ).packageManager;
    const installArgs = dockerfile.match(/^\s+pnpm ((?:i|install) [^&\r\n]*)/m)?.[1];
    expect(installArgs).toBeDefined();

    try {
      writeFileSync(
        path.join(cwd, 'package.json'),
        JSON.stringify({
          dependencies: { 'fixture-dep': 'file:./fixture-dep' },
          name: 'docker-pnpm-layout',
          packageManager,
          private: true,
        }),
      );
      writeFileSync(path.join(cwd, 'pnpm-workspace.yaml'), 'packages: []\n');
      const fixture = path.join(cwd, 'fixture-dep');
      // A local package keeps this regression independent of registry availability.
      mkdirSync(fixture);
      writeFileSync(
        path.join(fixture, 'package.json'),
        JSON.stringify({ main: 'index.js', name: 'fixture-dep', version: '1.0.0' }),
      );
      writeFileSync(path.join(fixture, 'index.js'), 'module.exports = 42;\n');

      const install = spawnSync('pnpm', installArgs!.trim().split(/\s+/), {
        cwd,
        encoding: 'utf8',
        timeout: 15_000,
      });
      expect(install.status, install.stderr).toBe(0);
      const dependency = path.join(cwd, 'node_modules/fixture-dep');
      const linkedBefore = lstatSync(dependency).isSymbolicLink();

      const exec = spawnSync('pnpm', ['exec', 'node', '-e', "require('fixture-dep')"], {
        cwd,
        encoding: 'utf8',
        timeout: 15_000,
      });
      expect(exec.status, exec.stderr).toBe(0);
      expect(lstatSync(dependency).isSymbolicLink()).toBe(linkedBefore);
    } finally {
      rmSync(cwd, { force: true, recursive: true });
    }
  });
});
