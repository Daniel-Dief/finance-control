/**
 * Monta o header `Authorization` esperado pelo backend no login:
 * `Basic base64(usuario:senha)`.
 *
 * `btoa` só aceita Latin-1, então a string é convertida para UTF-8 antes da
 * codificação — assim credenciais com acentos também funcionam.
 */
export function buildBasicAuthHeader(login: string, password: string): string {
  const bytes = new TextEncoder().encode(`${login}:${password}`);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `Basic ${btoa(binary)}`;
}
