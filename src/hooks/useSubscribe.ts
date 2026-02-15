import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SUBSCRIBE_ENDPOINT } from "@/lib/api";

export function useSubscribe() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStage, setDialogStage] = useState<"confirm" | "result">("confirm");
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
    setDialogOpen(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!email) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        const message =
          (data as { error?: string } | null)?.error || "Failed to subscribe";

        // Backend currently returns 400 for duplicates. We treat that as a non-error
        // for the new UX, and show an in-modal "already registered" message.
        if (message.toLowerCase().includes("already")) {
          setResultVariant("duplicate");
          setDialogStage("result");
          setEmail("");
          return;
        }

        setDialogOpen(false);
        toast.error(message);
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
