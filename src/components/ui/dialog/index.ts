export { default as Dialog } from './Dialog.vue';
export { default as DialogContent } from './DialogContent.vue';
export { default as DialogHeader } from './DialogHeader.vue';
export { default as DialogTitle } from './DialogTitle.vue';
export { default as DialogDescription } from './DialogDescription.vue';
export { default as DialogFooter } from './DialogFooter.vue';

export function getDialogOverlayClass() {
  return 'fixed inset-0 z-50 bg-[--overlay]';
}

export function getDialogContentClass() {
  return 'fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-elevated p-6 shadow-lg ring-offset-surface-card';
}
