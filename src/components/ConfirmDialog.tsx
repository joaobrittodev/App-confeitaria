import React, { useCallback } from 'react';
import { ConfirmDialog as PrimeConfirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonClassName?: string;
  icon?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmButtonClassName = 'p-button-danger',
  icon = 'pi pi-exclamation-triangle',
}) => {
  const handleConfirm = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <PrimeConfirmDialog
      visible={visible}
      onHide={handleCancel}
      header={title}
      message={message}
      icon={icon}
      accept={handleConfirm}
      reject={handleCancel}
      acceptLabel={confirmLabel}
      rejectLabel={cancelLabel}
      acceptClassName={`${confirmButtonClassName} confirm-dialog-btn`}
      rejectClassName="confirm-dialog-btn"
      closable={true}
      draggable={false}
      resizable={false}
      modal
      headerClassName="confirm-dialog-header"
    />
  );
};

export default ConfirmDialog;
