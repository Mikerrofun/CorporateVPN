/**
 * Типы для системы Toast-уведомлений
 */

export type ToastVariant = "success" | "error";

export type ToastType = {
  id: string;
  message: string;
  variant: ToastVariant;
};

export type ToastProps = {
  id: string;
  message: string;
  variant: ToastVariant;
  onClose: (id: string) => void;
};

export type ToastContextValue = {
  toasts: ToastType[];
  showToast: (message: string, variant: ToastVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  removeToast: (id: string) => void;
};
