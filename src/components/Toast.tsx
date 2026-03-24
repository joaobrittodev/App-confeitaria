import React, { useRef, useCallback } from 'react';
import { Toast as PrimeToast } from 'primereact/toast';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn';

export interface ToastHandle {
  show(severity: ToastSeverity, title: string, message: string): void;
  success(title: string, message: string): void;
  error(title: string, message: string): void;
  info(title: string, message: string): void;
  warn(title: string, message: string): void;
}

const Toast = React.forwardRef<ToastHandle>((_, ref) => {
  const toastRef = useRef<InstanceType<typeof PrimeToast>>(null);

  const show = useCallback((severity: ToastSeverity, title: string, message: string) => {
    toastRef.current?.show({
      severity,
      summary: title,
      detail: message,
      life: 4000,
      closable: true,
    });
  }, []);

  const success = useCallback((title: string, message: string) => {
    show('success', title, message);
  }, [show]);

  const error = useCallback((title: string, message: string) => {
    show('error', title, message);
  }, [show]);

  const info = useCallback((title: string, message: string) => {
    show('info', title, message);
  }, [show]);

  const warn = useCallback((title: string, message: string) => {
    show('warn', title, message);
  }, [show]);

  React.useImperativeHandle(ref, () => ({
    show,
    success,
    error,
    info,
    warn,
  }), [show, success, error, info, warn]);

  return (
    <PrimeToast
      ref={toastRef}
      style={{
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
      }}
      position="top-right"
    />
  );
});

Toast.displayName = 'Toast';

export default Toast;
