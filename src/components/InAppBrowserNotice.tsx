import { useState } from "react";
import { ExternalLink, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/components/Shared";
import {
  androidBrowserIntentUrl,
  detectInAppBrowser,
} from "@/lib/inAppBrowser";
import { useI18n } from "@/i18n/LanguageProvider";

export function InAppBrowserNotice() {
  const { t } = useI18n();
  const [browser] = useState(() => detectInAppBrowser());
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!browser || dismissed) {
    return null;
  }

  const currentUrl = window.location.href;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success(t("inApp.copySuccess"));
    } catch {
      toast.error(t("inApp.copyFail"));
    }
  }

  return (
    <div
      className="relative z-[60] px-4 py-3 text-center"
      style={{
        background: BRAND.navyDeep,
        borderBottom: `1px solid ${BRAND.gold}55`,
        color: BRAND.cream,
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="font-sans text-sm leading-snug">
          {t("inApp.body", { name: browser.name })}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {browser.platform === "android" ? (
            <a
              href={androidBrowserIntentUrl(currentUrl)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-semibold"
              style={{ background: BRAND.gold, color: BRAND.navyDeep }}
            >
              <ExternalLink size={15} />
              {t("inApp.openBrowser")}
            </a>
          ) : (
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-semibold"
              style={{ background: BRAND.gold, color: BRAND.navyDeep }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? t("inApp.copied") : t("inApp.copyLink")}
            </button>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t("inApp.dismiss")}
            className="p-2 rounded-full opacity-70 hover:opacity-100"
            style={{ color: BRAND.creamMuted }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {browser.platform === "ios" && (
        <p
          className="font-sans text-xs mt-2 max-w-3xl mx-auto"
          style={{ color: BRAND.creamMuted }}
        >
          {t("inApp.iosHint")}
        </p>
      )}
    </div>
  );
}
