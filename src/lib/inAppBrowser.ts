export type InAppBrowser = {
  /** Human-readable app name for the banner copy. */
  name: string;
  platform: "ios" | "android" | "other";
};

const SIGNATURES: Array<{ name: string; test: RegExp }> = [
  { name: "Instagram", test: /Instagram/i },
  { name: "Facebook", test: /FBAN|FBAV|FB_IAB/i },
  { name: "TikTok", test: /BytedanceWebview|musical_ly|TikTok/i },
  { name: "Snapchat", test: /Snapchat/i },
  { name: "LinkedIn", test: /LinkedInApp/i },
  { name: "Messenger", test: /Messenger/i },
  { name: "Threads", test: /Barcelona/i },
];

/**
 * Social apps render pages in a stripped-down webview where Clerk's auth
 * popups and the file picker frequently fail, so we detect them to warn users
 * before they lose a half-filled application.
 */
export function detectInAppBrowser(
  userAgent: string = typeof navigator === "undefined" ? "" : navigator.userAgent,
): InAppBrowser | null {
  const match = SIGNATURES.find((signature) => signature.test.test(userAgent));
  if (!match) {
    return null;
  }

  const platform: InAppBrowser["platform"] = /iPhone|iPad|iPod/i.test(userAgent)
    ? "ios"
    : /Android/i.test(userAgent)
      ? "android"
      : "other";

  return { name: match.name, platform };
}

/**
 * Android honours an intent that hands the URL to the default browser. iOS has
 * no equivalent, so callers fall back to instructions there.
 */
export function androidBrowserIntentUrl(url: string): string {
  const withoutScheme = url.replace(/^https?:\/\//, "");
  return `intent://${withoutScheme}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
}
