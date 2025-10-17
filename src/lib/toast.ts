import { soundManager } from "@/lib/sounds";
import toast from "react-hot-toast";

// Wrapper around react-hot-toast that plays sound effects
export const toastWithSound = {
  success: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    return toast.success(message, options);
  },

  error: (message: string, options?: Parameters<typeof toast.error>[1]) => {
    soundManager.play("error");
    return toast.error(message, options);
  },

  loading: (message: string, options?: Parameters<typeof toast.loading>[1]) => {
    return toast.loading(message, options);
  },

  custom: (
    jsx: Parameters<typeof toast.custom>[0],
    options?: Parameters<typeof toast.custom>[1],
  ) => {
    return toast.custom(jsx, options);
  },

  promise: toast.promise,
  dismiss: toast.dismiss,
  remove: toast.remove,
};

export default toastWithSound;
