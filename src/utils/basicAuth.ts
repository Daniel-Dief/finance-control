/**
 * Monta o header `Authorization` esperado pelo backend no login:
 * `Basic base64(usuario:senha)`.
 *
 * `btoa` só aceita Latin-1, então a string é convertida para UTF-8 antes da
 * codificação — assim credenciais com acentos também funcionam.
 */
export function buildBasicAuthHeader(login: string, password: string): string {
  return `Basic ${encodeBasicAuthCredentials(login, password)}`;
}

export function encodeBasicAuthCredentials(login: string, password: string): string {
  const bytes = new TextEncoder().encode(`${login}:${password}`);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export function decodeBasicAuthCredentials(
  credentials: string
): { login: string; password: string } | null {
  try {
    const binary = atob(credentials);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex <= 0) {
      return null;
    }

    return { login: decoded.slice(0, separatorIndex), password: decoded.slice(separatorIndex + 1) };
  } catch {
    return null;
  }
}
