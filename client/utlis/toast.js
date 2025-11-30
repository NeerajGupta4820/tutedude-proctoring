import { toast } from 'sonner';

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {object} options - Optional toast options
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    description: options.description,
    duration: 4000,
    ...options,
  });
};

/**
 * Show error notification
 * @param {string} message - Error message
 * @param {object} options - Optional toast options
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    description: options.description,
    duration: 4000,
    ...options,
  });
};

/**
 * Show info notification
 * @param {string} message - Info message
 * @param {object} options - Optional toast options
 */
export const showInfo = (message, options = {}) => {
  return toast.info(message, {
    description: options.description,
    duration: 4000,
    ...options,
  });
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {object} options - Optional toast options
 */
export const showWarning = (message, options = {}) => {
  return toast.warning(message, {
    description: options.description,
    duration: 4000,
    ...options,
  });
};

/**
 * Show loading notification
 * @param {string} message - Loading message
 * @param {object} options - Optional toast options
 */
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    description: options.description,
    ...options,
  });
};

/**
 * Dismiss a toast by ID
 * @param {string} toastId - Toast ID returned from show functions
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Update a toast
 * @param {string} toastId - Toast ID to update
 * @param {object} options - New toast options
 */
export const updateToast = (toastId, options = {}) => {
  toast(options.message || 'Updated', {
    id: toastId,
    ...options,
  });
};
