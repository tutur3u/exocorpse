import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Custom hook to track if a react-hook-form form has been modified (is dirty)
 * and handle confirmation dialogs when trying to exit with unsaved changes.
 *
 * @param form - The react-hook-form instance from useForm()
 * @returns Object containing isDirty state and confirmation dialog controls
 */
export function useFormDirtyState<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isDirty = form.formState.isDirty;

  /**
   * Attempts to exit the form. If the form is dirty, shows a confirmation dialog.
   * Otherwise, executes the exit action immediately.
   *
   * @param onExit - Callback to execute when exiting (after confirmation if needed)
   */
  const handleExit = (onExit: () => void) => {
    if (isDirty) {
      setPendingAction(() => onExit);
      setShowConfirmDialog(true);
    } else {
      onExit();
    }
  };

  /**
   * Confirms the exit action and executes the pending action
   */
  const confirmExit = () => {
    setShowConfirmDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  /**
   * Cancels the exit action and stays on the form
   */
  const cancelExit = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  // Warn user when trying to close browser tab/window with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but setting returnValue is still required
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return {
    isDirty,
    showConfirmDialog,
    handleExit,
    confirmExit,
    cancelExit,
  };
}
