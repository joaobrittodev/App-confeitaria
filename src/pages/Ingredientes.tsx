import { useState, useEffect, ReactNode, useRef } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast, { ToastHandle } from '../components/Toast'
import Icon from '../components/Icon'

interface Ingrediente {
  id: number
  nome: string
  quantidade: number
  preco: number
  criadoEm: string
}

interface FormData {
  nome: string
  quantidade: string
  preco: string
}

export default function Ingredientes(): ReactNode {
  const toastRef = useRef<ToastHandle>(null)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    quantidade: '',
    preco: ''
  })
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [deleteIngredienteId, setDeleteIngredienteId] = useState<number | null>(null)

  useEffect(() => {
    fetchIngredientes()
  }, [])

  const fetchIngredientes = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch('/api/ingredientes')
      const data: Ingrediente[] = await response.json()
      setIngredientes(data)
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!formData.nome || !formData.quantidade || !formData.preco) {
      toastRef.current?.warn('Validação', 'Por favor, preencha todos os campos')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/ingredientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          quantidade: parseFloat(formData.quantidade),
          preco: parseFloat(formData.preco)
        })
      })

      if (response.ok) {
        setFormData({ nome: '', quantidade: '', preco: '' })
        fetchIngredientes()
        toastRef.current?.success('Sucesso', 'Ingrediente adicionado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao adicionar ingrediente:', error)
      toastRef.current?.error('Erro', 'Erro ao adicionar ingrediente')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteIngrediente = (id: number): void => {
    setDeleteIngredienteId(id)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteIngredienteId === null) return
    try {
      await fetch(`/api/ingredientes/${deleteIngredienteId}`, { method: 'DELETE' })
      fetchIngredientes()
      setShowDeleteDialog(false)
      setDeleteIngredienteId(null)
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error)
      setShowDeleteDialog(false)
      setDeleteIngredienteId(null)
    }
  }

  return (
    <div>
      <Toast ref={toastRef} />

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="Plus" size={24} />
          <h2>Adicionar Novo Ingrediente</h2>
        </div>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome do Ingrediente</label>
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: Farinha de Trigo"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="quantidade">Quantidade (g/ml)</label>
                <input
                  id="quantidade"
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  placeholder="Ex: 500"
                  step="0.01"
                />
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
                />
              </div>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Adicionando...' : '✓ Adicionar Ingrediente'}
            </button>
          </form>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="Package" size={24} />
          <h2>Ingredientes Registrados</h2>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando ingredientes...</p>
          </div>
        ) : ingredientes.length === 0 ? (
          <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="Inbox" size={48} />
          </div>
            <p>Nenhum ingrediente registrado ainda</p>
          </div>
        ) : (
          <div className="ingredient-list">
            {ingredientes.map(ingrediente => (
              <div key={ingrediente.id} className="ingredient-item">
                <div className="ingredient-item-info">
                  <div className="ingredient-item-name">{ingrediente.nome}</div>
                  <div className="ingredient-item-details">
                    {ingrediente.quantidade}g/ml • R$ {parseFloat(String(ingrediente.preco)).toFixed(2)}
                  </div>
                </div>
                <div className="ingredient-item-actions">
                  <button
                    onClick={() => handleDeleteIngrediente(ingrediente.id)}
                    className="danger"
                    title="Deletar ingrediente"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Deletar Ingrediente"
        message="Tem certeza que deseja deletar este ingrediente? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeleteIngredienteId(null)
        }}
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        confirmButtonClassName="p-button-danger"
        icon="pi pi-trash"
      />
    </div>
  )
}
