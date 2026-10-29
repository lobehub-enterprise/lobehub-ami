import { describe, expect, it } from 'vitest';

import { getCliLoginCommand } from './cliLoginCommand';

describe('getCliLoginCommand', () => {
  it('points the CLI at the server the user is signed in to', () => {
    expect(getCliLoginCommand('https://lobe.example.com')).toBe(
      'lh login --server https://lobe.example.com',
    );
  });

  it('drops a trailing slash so the CLI stores the bare origin', () => {
    expect(getCliLoginCommand('https://lobe.example.com/')).toBe(
      'lh login --server https://lobe.example.com',
    );
  });

  it('falls back to the bare command when the server is unknown', () => {
    expect(getCliLoginCommand('')).toBe('lh login');
    expect(getCliLoginCommand(undefined)).toBe('lh login');
  });
});
