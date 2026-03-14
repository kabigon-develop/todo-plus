export { default as Dialog } from './Dialog.vue';
export { default as DialogContent } from './DialogContent.vue';
export { default as DialogHeader } from './DialogHeader.vue';
export { default as DialogTitle } from './DialogTitle.vue';
export { default as DialogDescription } from './DialogDescription.vue';
export { default as DialogFooter } from './DialogFooter.vue';

export function getDialogOverlayClass() {
  return 'fixed inset-0 z-50 bg-[--overlay] backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150';
}

export function getDialogContentClass() {
  return 'fixed bottom-0 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 rounded-t-xl border-t border-border bg-surface-elevated p-6 shadow-lg ring-offset-surface-card data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150';
}
