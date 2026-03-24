import React, { useCallback, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Icon from './Icon';

export interface IngredienteFormData {
  nome: string;
  quantidade: string;
  preco: string;
  tipo: 'g' | 'ml' | 'unidade';
}

export interface IngredienteFormDialogProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: IngredienteFormData;
  onConfirm: (formData: IngredienteFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const IngredienteFormDialog: React.FC<IngredienteFormDialogProps> = ({
  visible,
  mode,
  initialData,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<IngredienteFormData>({
    nome: '',
    quantidade: '',
    preco: '',
    tipo: 'g',
  });

  useEffect(() => {
    if (visible && mode === 'edit' && initialData) {
      setFormData(initialData);
    } else if (visible && mode === 'create') {
      setFormData({
        nome: '',
        quantidade: '',
        preco: '',
        tipo: 'g',
      });
    }
  }, [visible, mode, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirm = useCallback(() => {
    if (formData.nome && formData.quantidade && formData.preco) {
      onConfirm(formData);
      setFormData({
        nome: '',
        quantidade: '',
        preco: '',
        tipo: 'g',
      });
    }
  }, [formData, onConfirm]);

  const handleCancel = useCallback(() => {
    setFormData({
      nome: '',
      quantidade: '',
      preco: '',
      tipo: 'g',
    });
    onCancel?.();
  }, [onCancel]);

  const title =
    mode === 'create'
      ? 'Adicionar Novo Ingrediente'
      : 'Editar Ingrediente';

  const isFormValid =
    formData.nome.trim() !== '' &&
    formData.quantidade.trim() !== '' &&
    formData.preco.trim() !== '';

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
          <label htmlFor="nome">Nome do Ingrediente</label>
          <input
            id="nome"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Ex: Farinha de Trigo"
            autoFocus
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="quantidade">Quantidade</label>
            <input
              id="quantidade"
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleInputChange}
              placeholder="Ex: 500"
              step="0.01"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="unidade">unidade</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="preco">Preço (R$)</label>
          <input
            id="preco"
            type="number"
            name="preco"
            value={formData.preco}
            onChange={handleInputChange}
            placeholder="Ex: 10.50"
            step="0.01"
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

export default IngredienteFormDialog;
