import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { IoClose } from 'react-icons/io5';

export const DialogContent = React.forwardRef(({ children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <Dialog.Content
      ref={ref}
      className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
      {...props}
    >
      {children}
      <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
        <IoClose className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
));
DialogContent.displayName = Dialog.Content.displayName;

export const DialogHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight text-gray-900 ${className || ''}`}
    {...props}
  />
));
DialogTitle.displayName = Dialog.Title.displayName;

export const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <Dialog.Description
      ref={ref}
      className={`text-sm text-gray-600 ${className || ''}`}
      {...props}
    />
  )
);
DialogDescription.displayName = Dialog.Description.displayName;

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogClose = Dialog.Close;

/**
 * Utility component for creating dialogs
 */
export const AlertDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogRoot>
  );
};

/**
 * Utility component for confirmation dialogs
 */
export const ConfirmDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default', // 'default', 'danger', 'success'
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      default:
        return 'bg-cyan-700 text-white hover:bg-cyan-800';
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${getButtonStyles()}`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
