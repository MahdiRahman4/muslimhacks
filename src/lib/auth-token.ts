type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

export async function getAuthTokenAsync(): Promise<string | null> {
  if (tokenGetter) {
    return tokenGetter();
  }
  return null;
}
