import { useState, useEffect, ReactNode, useRef } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import IngredienteFormDialog, { IngredienteFormData } from '../components/IngredienteFormDialog'
import Toast, { ToastHandle } from '../components/Toast'
import Icon from '../components/Icon'

interface Ingrediente {
  id: number
  nome: string
  quantidade: number
  preco: number
  tipo: 'g' | 'ml' | 'unidade'
  criadoEm: string
}

export default function Ingredientes(): ReactNode {
  const toastRef = useRef<ToastHandle>(null)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [deleteIngredienteId, setDeleteIngredienteId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredIngredientes, setFilteredIngredientes] = useState<Ingrediente[]>([])
  const [showIngredienteDialog, setShowIngredienteDialog] = useState<boolean>(false)
  const [ingredienteDialogMode, setIngredienteDialogMode] = useState<'create' | 'edit'>('create')
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null)

  useEffect(() => {
    fetchIngredientes()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredIngredientes(ingredientes)
    } else {
      const filtered = ingredientes.filter(ing =>
        ing.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredIngredientes(filtered)
    }
  }, [searchTerm, ingredientes])

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

  const handleOpenCreateDialog = (): void => {
    setEditingIngrediente(null)
    setIngredienteDialogMode('create')
    setShowIngredienteDialog(true)
  }

  const handleOpenEditDialog = (ingrediente: Ingrediente): void => {
    setEditingIngrediente(ingrediente)
    setIngredienteDialogMode('edit')
    setShowIngredienteDialog(true)
  }

  const handleSubmitIngrediente = async (formData: IngredienteFormData): Promise<void> => {
    try {
      setSubmitting(true)
      const method = ingredienteDialogMode === 'create' ? 'POST' : 'PATCH'
      const url = ingredienteDialogMode === 'create' ? '/api/ingredientes' : `/api/ingredientes/${editingIngrediente?.id}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          quantidade: parseFloat(formData.quantidade),
          preco: parseFloat(formData.preco),
          tipo: formData.tipo
        })
      })

      if (response.ok) {
        fetchIngredientes()
        setShowIngredienteDialog(false)
        setEditingIngrediente(null)
        toastRef.current?.success('Sucesso', ingredienteDialogMode === 'create' ? 'Ingrediente adicionado com sucesso!' : 'Ingrediente atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao salvar ingrediente:', error)
      toastRef.current?.error('Erro', 'Erro ao salvar ingrediente')
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="Plus" size={24} />
            <h2>Adicionar Novo Ingrediente</h2>
          </div>
          <button onClick={handleOpenCreateDialog} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="Plus" size={16} />
            Novo Ingrediente
          </button>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="Package" size={24} />
          <h2>Ingredientes Registrados</h2>
        </div>

        <div className="search-box" style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Pesquisar ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando ingredientes...</p>
          </div>
        ) : filteredIngredientes.length === 0 ? (
          <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="Inbox" size={48} />
          </div>
            <p>{searchTerm ? 'Nenhum ingrediente encontrado' : 'Nenhum ingrediente registrado ainda'}</p>
          </div>
        ) : (
          <div className="ingredient-list">
            {filteredIngredientes.map(ingrediente => (
              <div key={ingrediente.id} className="ingredient-item">
                <div className="ingredient-item-info">
                  <div className="ingredient-item-name">{ingrediente.nome}</div>
                  <div className="ingredient-item-details">
                    {ingrediente.quantidade}{ingrediente.tipo} • R$ {parseFloat(String(ingrediente.preco)).toFixed(2)}
                  </div>
                </div>
                <div className="ingredient-item-actions">
                  <button
                    onClick={() => handleOpenEditDialog(ingrediente)}
                    className="secondary"
                    title="Editar ingrediente"
                  >
                    <Icon name="Edit" size={16} />
                  </button>
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

      <IngredienteFormDialog
        visible={showIngredienteDialog}
        mode={ingredienteDialogMode}
        initialData={
          editingIngrediente
            ? {
                nome: editingIngrediente.nome,
                quantidade: String(editingIngrediente.quantidade),
                preco: String(editingIngrediente.preco),
                tipo: editingIngrediente.tipo
              }
            : undefined
        }
        onConfirm={handleSubmitIngrediente}
        onCancel={() => {
          setShowIngredienteDialog(false)
          setEditingIngrediente(null)
        }}
        isLoading={submitting}
      />
    </div>
  )
}
