type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

export async function getAuthTokenAsync(): Promise<string | null> {
  if (!tokenGetter) {
    return null;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = await tokenGetter();
    if (token) {
      return token;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return null;
}
