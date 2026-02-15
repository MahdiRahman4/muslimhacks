import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export type SubscribeDialogVariant = "success" | "duplicate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  isSubmitting: boolean;
  stage: "confirm" | "result";
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
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-cream/10 bg-[hsl(235_40%_12%)] text-cream"
        onInteractOutside={(e) => {
          if (isMobile) e.preventDefault();
        }}
      >
        {stage === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl md:text-3xl text-cream">
                Please confirm your email address:
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2">
              <p className="font-sans text-base text-cream/70">
                We’ll send updates when registration opens.
              </p>
              <p className="mt-3 font-sans text-lg md:text-xl font-semibold text-cream break-all">
                {email}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onGoBack}
                className="border-cream/30 text-cream hover:bg-cream/10"
              >
                Go back
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber to-rose hover:from-amber-glow hover:to-rose text-plum-deep font-semibold"
              >
                {isSubmitting ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl md:text-3xl text-cream">
                {resultVariant === "duplicate"
                  ? "You have already been pre-registered!"
                  : "Thank you for pre-registering!"}
              </DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-3">
              <p className="font-sans text-base text-cream/70">
                {resultVariant === "duplicate"
                  ? "You’re already on our list — no action needed."
                  : "You’re on the list. We can’t wait to share updates."}
              </p>
              <p className="font-sans text-base md:text-lg font-bold text-cream">
                Check ALL your inboxes and SPAM just in case!
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

