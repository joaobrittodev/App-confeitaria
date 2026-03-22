import { useState, useEffect, ReactNode, useRef } from 'react'
import { NavigateParams } from '../App'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast, { ToastHandle } from '../components/Toast'
import Icon from '../components/Icon'


interface Receita {
  id: number
  nomeReceita: string
  custoTotal: number
  criadoEm: string
}

interface HomeProps {
  onNavigate: (params: NavigateParams) => void
}

export default function Home({ onNavigate }: HomeProps): ReactNode {
  const toastRef = useRef<ToastHandle>(null)
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredReceitas, setFilteredReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [deleteReceitaId, setDeleteReceitaId] = useState<number | null>(null)

  useEffect(() => {
    fetchReceitas()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredReceitas(receitas)
    } else {
      const filtered = receitas.filter(receita =>
        receita?.nomeReceita?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredReceitas(filtered)
    }
  }, [searchTerm, receitas])

  const fetchReceitas = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch('/api/receitas')
      const data: Receita[] = await response.json()
      setReceitas(data)
      setFilteredReceitas(data)
    } catch (error) {
      console.error('Erro ao buscar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReceita = (id: number): void => {
    setDeleteReceitaId(id)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteReceitaId === null) return
    try {
      await fetch(`/api/receitas/${deleteReceitaId}`, { method: 'DELETE' })
      fetchReceitas()
      setShowDeleteDialog(false)
      setDeleteReceitaId(null)
    } catch (error) {
      console.error('Erro ao deletar receita:', error)
      setShowDeleteDialog(false)
      setDeleteReceitaId(null)
    }
  }

  return (
    <div>
      <Toast ref={toastRef} />

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="Search" size={24} />
          <h2>Pesquisar Receitas</h2>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Digite o nome da receita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="ClipboardList" size={24} />
          <h2>Todas as Receitas</h2>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando receitas...</p>
          </div>
        ) : filteredReceitas.length === 0 ? (
          <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="Inbox" size={48} />
          </div>
            <p>Nenhuma receita registrada ainda</p>
            <button onClick={() => onNavigate({ page: 'receitas' })}>
              Criar Primeira Receita
            </button>
          </div>
        ) : (
          <div className="grid">
            {filteredReceitas.map(receita => (
              <div key={receita.id} className="recipe-card">
                <div className="recipe-card-header">
                  <h3>{receita.nomeReceita}</h3>
                  <div className="recipe-cost">
                    R$ {parseFloat(String(receita.custoTotal)).toFixed(2)}
                  </div>
                </div>
                <p className="recipe-description">
                  Clique para ver detalhes
                </p>
                <div className="recipe-actions">
                  <button
                    onClick={() => onNavigate({ page: 'detail', receitaId: receita.id })}
                    className="secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Icon name="Eye" size={16} />
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleDeleteReceita(receita.id)}
                    className="danger"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Icon name="Trash2" size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Deletar Receita"
        message="Tem certeza que deseja deletar esta receita? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeleteReceitaId(null)
        }}
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        confirmButtonClassName="p-button-danger"
        icon="pi pi-trash"
      />
    </div>
  )
}
