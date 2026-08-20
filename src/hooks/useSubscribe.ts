import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useTranslation } from "react-i18next";
import { SUBSCRIBE_ENDPOINT } from "@/lib/api";

export function useSubscribe() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStage, setDialogStage] = useState<"confirm" | "verifying" | "result">("confirm");
  const [resultVariant, setResultVariant] = useState<"success" | "duplicate" | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const resetDialog = useCallback(() => {
    setDialogStage("confirm");
    setResultVariant(null);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) resetDialog();
    },
    [resetDialog],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    resetDialog();
    setDialogOpen(true);
  };

  const handleGoBack = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const subscribe = useCallback(
    async (recaptchaToken: string, recaptchaAction: string) => {
    if (!email) return;

    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, recaptchaToken, recaptchaAction }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        const message =
          (data as { error?: string } | null)?.error || t("subscribeToasts.failed");

        setDialogOpen(false);
        toast.error(message);
        return;
      }

      const alreadyRegistered = Boolean(
        (data as { alreadyRegistered?: boolean } | null)?.alreadyRegistered,
      );

      if (alreadyRegistered) {
        setResultVariant("duplicate");
        setDialogStage("result");
        setEmail("");
        return;
      }

      setResultVariant("success");
      setDialogStage("result");
      setEmail("");
    } catch (error) {
      console.error("Subscription error:", error);
      setDialogOpen(false);
      toast.error(t("subscribeToasts.genericError"));
    }
  }, [email, t]);

  const handleConfirm = useCallback(async () => {
    if (!email) return;

    setDialogStage("verifying");
    setIsSubmitting(true);

    try {
      if (!executeRecaptcha) {
        setDialogOpen(false);
        toast.error(t("subscribeToasts.captchaNotReady"));
        return;
      }

      const action = "pre_register";
      let token: string | undefined;
      try {
        token = await executeRecaptcha(action);
      } catch (error) {
        console.error("reCAPTCHA execute error:", error);
      }

      if (!token) {
        setDialogOpen(false);
        toast.error(t("subscribeToasts.captchaFailed"));
        return;
      }

      await subscribe(token, action);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, executeRecaptcha, subscribe, t]);

  return {
    email,
    setEmail,
    isSubmitting,
    handleSubmit,
    dialogOpen,
    onDialogOpenChange: handleDialogOpenChange,
    dialogStage,
    resultVariant,
    handleConfirm,
    handleGoBack,
  };
}
