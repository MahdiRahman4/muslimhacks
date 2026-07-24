const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    HASH_BYTES * 8,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = new Uint8Array(await deriveKey(password, salt));
  return `pbkdf2:${ITERATIONS}:${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return false;
  }

  const iterations = Number(parts[1]);
  if (iterations !== ITERATIONS) {
    return false;
  }

  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const actual = new Uint8Array(await deriveKey(password, salt));

  if (actual.length !== expected.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual[i] ^ expected[i];
  }

  return diff === 0;
}
