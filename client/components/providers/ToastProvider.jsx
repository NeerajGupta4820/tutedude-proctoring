import React from 'react';
import { Toaster } from 'sonner';

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        theme="light"
        expand={true}
        pauseWhenPageIsHidden
        visibleToasts={3}
        closeButton
        style={{
          fontSize: '14px',
          borderRadius: '8px',
        }}
      />
    </>
  );
};

export default ToastProvider;
