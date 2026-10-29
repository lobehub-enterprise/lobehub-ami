/**
 * `lh login` defaults to the official cloud, so a self-hosted instance has to
 * name itself; the CLI then discovers that server's device gateway on connect.
 */
export const getCliLoginCommand = (serverUrl: string | undefined): string => {
  const server = serverUrl?.replace(/\/+$/, '');
  return server ? `lh login --server ${server}` : 'lh login';
};
