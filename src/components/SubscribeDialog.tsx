import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReCAPTCHA from "react-google-recaptcha";

export type SubscribeDialogVariant = "success" | "duplicate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  isSubmitting: boolean;
  stage: "confirm" | "captcha" | "result";
  resultVariant: SubscribeDialogVariant | null;
  onGoBack: () => void;
  onConfirm: () => void;
  onCaptchaToken: (token: string | null) => void;
  onCaptchaError: () => void;
  onCaptchaExpired: () => void;
};

export default function SubscribeDialog({
  open,
  onOpenChange,
  email,
  isSubmitting,
  stage,
  resultVariant,
  onGoBack,
  onConfirm,
  onCaptchaToken,
  onCaptchaError,
  onCaptchaExpired,
}: Props) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border border-black/10 bg-white text-black w-[92vw] max-w-sm sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto pr-14 p-5 pt-12 sm:p-6 sm:pt-6"
      >
        {stage === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-xl md:text-2xl font-semibold text-black">
                Please confirm your email address:
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2">
              <p className="font-sans text-sm md:text-base text-black/70">
                We’ll send updates when registration opens.
              </p>
              <p className="mt-3 font-sans text-base md:text-lg font-semibold text-black break-all">
                {email}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onGoBack}
                className="border-black/20 text-black hover:bg-black/5"
              >
                Go back
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-black/90 font-semibold"
              >
                {isSubmitting ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </>
        ) : stage === "captcha" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-xl md:text-2xl font-semibold text-black">
                One more step
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-4">
              <p className="font-sans text-sm md:text-base text-black/70">
                Please complete the verification below to confirm you’re not a bot.
              </p>

              {!siteKey ? (
                <p className="font-sans text-sm md:text-base text-black/70">
                  reCAPTCHA isn’t configured yet. Add{" "}
                  <span className="font-mono">VITE_RECAPTCHA_SITE_KEY</span> to your
                  frontend env.
                </p>
              ) : (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={siteKey}
                    onChange={onCaptchaToken}
                    onErrored={onCaptchaError}
                    onExpired={onCaptchaExpired}
                  />
                </div>
              )}

              {isSubmitting ? (
                <p className="font-sans text-sm text-black/60 text-center">
                  Verifying…
                </p>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onGoBack}
                className="border-black/20 text-black hover:bg-black/5"
              >
                Go back
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-xl md:text-2xl font-semibold text-black">
                {resultVariant === "duplicate"
                  ? "You have already been pre-registered!"
                  : "Thank you for pre-registering!"}
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-3">
              <p className="font-sans text-sm md:text-base text-black/70">
                {resultVariant === "duplicate"
                  ? "You’re already on our list — no action needed."
                  : "You’re on the list. We can’t wait to share updates."}
              </p>
              <p className="rounded-md border border-black/15 bg-black/5 px-4 py-3 font-sans text-base md:text-lg font-extrabold text-black">
                Check{" "}
                <span className="font-black underline underline-offset-2">ALL</span>{" "}
                your{" "}
                <span className="font-black underline underline-offset-2">INBOXES</span>{" "}
                and{" "}
                <span className="font-black underline underline-offset-2">SPAM</span>{" "}
                just in case!
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

