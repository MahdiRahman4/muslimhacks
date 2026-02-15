import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SUBSCRIBE_ENDPOINT } from "@/lib/api";

export function useSubscribe() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStage, setDialogStage] = useState<"confirm" | "captcha" | "result">("confirm");
  const [resultVariant, setResultVariant] = useState<"success" | "duplicate" | null>(null);

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
    // If the user is in the captcha step, "Go back" should bring them
    // back to email confirmation (so they can fix typos), not close the modal.
    if (dialogStage === "captcha") {
      setDialogStage("confirm");
      return;
    }

    setDialogOpen(false);
  }, [dialogStage]);

  const handleConfirm = useCallback(() => {
    if (!email) return;
    setDialogStage("captcha");
  }, [email]);

  const subscribe = useCallback(async (recaptchaToken: string) => {
    if (!email) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, recaptchaToken }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        const message =
          (data as { error?: string } | null)?.error || "Failed to subscribe";

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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  const handleCaptchaToken = useCallback(
    async (token: string | null) => {
      if (!token) return;
      await subscribe(token);
    },
    [subscribe],
  );

  const handleCaptchaError = useCallback(() => {
    setDialogOpen(false);
    toast.error("Captcha verification failed. Please try again.");
  }, []);

  const handleCaptchaExpired = useCallback(() => {
    setDialogOpen(false);
    toast.error("Captcha expired. Please try again.");
  }, []);

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
    handleCaptchaToken,
    handleCaptchaError,
    handleCaptchaExpired,
  };
}
