import { describe, expect, it } from "vitest";
import { androidBrowserIntentUrl, detectInAppBrowser } from "@/lib/inAppBrowser";

const INSTAGRAM_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 331.0.0.37.90 (iPhone14,3; iOS 17_5)";
const INSTAGRAM_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 Instagram 320.0.0.42.101 Android";
const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const CHROME_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

describe("detectInAppBrowser", () => {
  it("flags the Instagram webview on iOS", () => {
    expect(detectInAppBrowser(INSTAGRAM_IOS)).toEqual({
      name: "Instagram",
      platform: "ios",
    });
  });

  it("flags the Instagram webview on Android", () => {
    expect(detectInAppBrowser(INSTAGRAM_ANDROID)).toEqual({
      name: "Instagram",
      platform: "android",
    });
  });

  it("flags Facebook's webview from its FBAN/FBAV tokens", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/456.0.0.32.108]";
    expect(detectInAppBrowser(ua)?.name).toBe("Facebook");
  });

  it("leaves real browsers alone", () => {
    expect(detectInAppBrowser(SAFARI_IOS)).toBeNull();
    expect(detectInAppBrowser(CHROME_DESKTOP)).toBeNull();
  });
});

describe("androidBrowserIntentUrl", () => {
  it("hands the https URL to the default browser", () => {
    expect(androidBrowserIntentUrl("https://muslimhacks.ca/apply")).toBe(
      "intent://muslimhacks.ca/apply#Intent;scheme=https;action=android.intent.action.VIEW;end",
    );
  });
});
