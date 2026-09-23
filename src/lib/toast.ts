export type ToastKind = "success" | "error";

export function showToast(message: string, kind: ToastKind = "success") {
  window.dispatchEvent(new CustomEvent("freano-toast", { detail: { message, kind } }));
}
