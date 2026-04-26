import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

/**
 * SuccessModal — Unified success confirmation popup.
 *
 * Props:
 * - open (boolean): Whether the modal is visible.
 * - onConfirm (function): Called when the user clicks OK / confirms.
 * - title (string): Headline text (default: "Success!").
 * - description (string): Body message.
 * - confirmLabel (string): Button label (default: "OK").
 * - onOpenChange (function): Called when visibility should change (e.g. overlay click).
 */
export default function SuccessModal({
  open = false,
  onConfirm,
  title = "Success!",
  description = "Your action was completed successfully.",
  confirmLabel = "OK",
  onOpenChange,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange ?? (() => {})}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-2">
          <Button
            onClick={onConfirm}
            className="min-w-[140px] h-11 rounded-xl text-base font-bold shadow-md"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
