import React, { useCallback, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Icon from './Icon';

export interface ReceitaFormData {
  nomeReceita: string;
}

export interface ReceitaFormDialogProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: ReceitaFormData;
  onConfirm: (formData: ReceitaFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ReceitaFormDialog: React.FC<ReceitaFormDialogProps> = ({
  visible,
  mode,
  initialData,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [nomeReceita, setNomeReceita] = useState<string>('');

  useEffect(() => {
    if (visible && mode === 'edit' && initialData) {
      setNomeReceita(initialData.nomeReceita);
    } else if (visible && mode === 'create') {
      setNomeReceita('');
    }
  }, [visible, mode, initialData]);

  const handleConfirm = useCallback(() => {
    if (nomeReceita.trim()) {
      onConfirm({ nomeReceita });
      setNomeReceita('');
    }
  }, [nomeReceita, onConfirm]);

  const handleCancel = useCallback(() => {
    setNomeReceita('');
    onCancel?.();
  }, [onCancel]);

  const title =
    mode === 'create'
      ? 'Criar Nova Receita'
      : 'Editar Receita';

  const isFormValid = nomeReceita.trim() !== '';

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>{title}</span>
          <button
            onClick={handleCancel}
            className="dialog-close-btn"
            title="Fechar"
          >
            <Icon name="X" size={20} color="white" />
          </button>
        </div>
      }
      modal
      closable={false}
      draggable={false}
      resizable={false}
      breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      style={{ width: '90vw', maxWidth: '500px' }}
      headerClassName="dialog-header"
      contentStyle={{ padding: '1.5rem' }}
      headerStyle={{ padding: '1.5rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="nomeReceita">Nome da Receita</label>
          <input
            id="nomeReceita"
            type="text"
            value={nomeReceita}
            onChange={(e) => setNomeReceita(e.target.value)}
            placeholder="Ex: Bolo de Chocolate"
            autoFocus
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleCancel}
            className="secondary"
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: '1 1 auto',
              minWidth: '120px',
              justifyContent: 'center',
            }}
          >
            <Icon name="X" size={16} />
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isFormValid || isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: '1 1 auto',
              minWidth: '120px',
              justifyContent: 'center',
            }}
          >
            <Icon name="Check" size={16} />
            {isLoading ? 'Salvando...' : mode === 'create' ? 'Adicionar' : 'Atualizar'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ReceitaFormDialog;
