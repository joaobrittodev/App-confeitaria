import React, { useCallback, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Icon from './Icon';

export interface QuantidadeDialogProps {
  visible: boolean;
  ingredienteName: string;
  onConfirm: (quantidade: number) => void;
  onCancel?: () => void;
  initialQuantidade?: number;
}

const QuantidadeDialog: React.FC<QuantidadeDialogProps> = ({
  visible,
  ingredienteName,
  onConfirm,
  onCancel,
  initialQuantidade = 100,
}) => {
  const [quantidade, setQuantidade] = useState(initialQuantidade);

  useEffect(() => {
    setQuantidade(initialQuantidade);
  }, [initialQuantidade, visible]);

  const handleConfirm = useCallback(() => {
    if (quantidade > 0) {
      onConfirm(quantidade);
      setQuantidade(initialQuantidade);
    }
  }, [quantidade, onConfirm, initialQuantidade]);

  const handleCancel = useCallback(() => {
    setQuantidade(initialQuantidade);
    onCancel?.();
  }, [initialQuantidade, onCancel]);

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={`Adicionar Quantidade - ${ingredienteName}`}
      modal
      closable={true}
      draggable={false}
      resizable={false}
      breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      style={{ width: '90vw', maxWidth: '450px' }}
      headerClassName="dialog-header"
      contentStyle={{ padding: '1.5rem' }}
      headerStyle={{ padding: '1.5rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="form-group">
          <label htmlFor="quantidade-input">Quantidade Usada</label>
          <input
            id="quantidade-input"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
            placeholder="Digite a quantidade"
            step="0.01"
            min="0"
            autoFocus
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
          
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCancel}
            className="secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: '1 1 auto',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <Icon name="X" size={16} />
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={quantidade <= 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: '1 1 auto',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <Icon name="Check" size={16} />
            Confirmar
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default QuantidadeDialog;
