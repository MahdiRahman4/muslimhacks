import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export type SubscribeDialogVariant = "success" | "duplicate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  isSubmitting: boolean;
  stage: "confirm" | "verifying" | "result";
  resultVariant: SubscribeDialogVariant | null;
  onGoBack: () => void;
  onConfirm: () => void;
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
}: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border border-black/10 bg-white text-black w-[92vw] max-w-sm sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto pr-14 p-5 pt-12 sm:p-6 sm:pt-6"
      >
        {stage === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-xl md:text-2xl font-semibold text-black">
                {t("subscribeDialog.confirmTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2">
              <p className="font-sans text-sm md:text-base text-black/70">
                {t("subscribeDialog.confirmBody")}
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
                {t("subscribeDialog.goBack")}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-black/90 font-semibold"
              >
                {isSubmitting ? t("subscribeDialog.confirming") : t("subscribeDialog.confirm")}
              </Button>
            </DialogFooter>
          </>
        ) : stage === "verifying" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-xl md:text-2xl font-semibold text-black">
                {t("subscribeDialog.verifyingTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-3">
              <p className="font-sans text-sm md:text-base text-black/70">
                {t("subscribeDialog.verifyingBody")}
              </p>
              <p className="font-sans text-sm text-black/60">
                {t("subscribeDialog.verifyingNote")}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onGoBack}
                className="border-black/20 text-black hover:bg-black/5"
              >
                {t("subscribeDialog.goBack")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-xl md:text-2xl font-semibold text-black">
                {resultVariant === "duplicate"
                  ? t("subscribeDialog.duplicateTitle")
                  : t("subscribeDialog.successTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-3">
              <p className="font-sans text-sm md:text-base text-black/70">
                {resultVariant === "duplicate"
                  ? t("subscribeDialog.duplicateBody")
                  : t("subscribeDialog.successBody")}
              </p>
              <p className="rounded-md border border-black/15 bg-black/5 px-4 py-3 font-sans text-base md:text-lg font-extrabold text-black">
                {t("subscribeDialog.checkInboxPrefix")}{" "}
                <span className="font-black underline underline-offset-2">
                  {t("subscribeDialog.checkInboxAll")}
                </span>{" "}
                {t("subscribeDialog.checkInboxYour")}{" "}
                <span className="font-black underline underline-offset-2">
                  {t("subscribeDialog.checkInboxInboxes")}
                </span>{" "}
                {t("subscribeDialog.checkInboxAnd")}{" "}
                <span className="font-black underline underline-offset-2">
                  {t("subscribeDialog.checkInboxSpam")}
                </span>{" "}
                {t("subscribeDialog.checkInboxSuffix")}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

