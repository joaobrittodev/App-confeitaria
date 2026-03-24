import { useState, useEffect, ReactNode, useRef } from 'react'
import { NavigateParams } from '../App'
import ConfirmDialog from '../components/ConfirmDialog'
import QuantidadeDialog from '../components/QuantidadeDialog'
import Toast, { ToastHandle } from '../components/Toast'
import Icon from '../components/Icon'

interface Ingrediente {
  id: number
  nome: string
  quantidade: number
  preco: number
  criadoEm: string
}

interface Receita {
  id: number
  nomeReceita: string
  custoTotal: number
  criadoEm: string
}

interface SelectedIngrediente {
  ingredienteId: number
  quantidadeUsada: number
}

interface ReceitasProps {
  onNavigate: (params: NavigateParams) => void
}

export default function Receitas({ onNavigate }: ReceitasProps): ReactNode {
  const toastRef = useRef<ToastHandle>(null)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [nomeReceita, setNomeReceita] = useState<string>('')
  const [selectedIngredientes, setSelectedIngredientes] = useState<SelectedIngrediente[]>([])
  const [custoTotal, setCustoTotal] = useState<number>(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [deleteReceitaId, setDeleteReceitaId] = useState<number | null>(null)
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState<string>('')
  const [filteredIngredientsForSelection, setFilteredIngredientsForSelection] = useState<Ingrediente[]>([])
  const [showQuantidadeDialog, setShowQuantidadeDialog] = useState<boolean>(false)
  const [selectedIngredienteIdForQuantidade, setSelectedIngredienteIdForQuantidade] = useState<number | null>(null)

  useEffect(() => {
    fetchIngredientes()
    fetchReceitas()
  }, [])

  useEffect(() => {
    calcularCustoTotal()
  }, [selectedIngredientes, ingredientes])

  useEffect(() => {
    if (ingredientSearchTerm.trim() === '') {
      setFilteredIngredientsForSelection(ingredientes)
    } else {
      const filtered = ingredientes.filter(ing =>
        ing.nome.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
      )
      setFilteredIngredientsForSelection(filtered)
    }
  }, [ingredientSearchTerm, ingredientes])

  const fetchIngredientes = async (): Promise<void> => {
    try {
      const response = await fetch('/api/ingredientes')
      const data: Ingrediente[] = await response.json()
      setIngredientes(data)
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error)
    }
  }

  const fetchReceitas = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch('/api/receitas')
      const data: Receita[] = await response.json()
      setReceitas(data)
    } catch (error) {
      console.error('Erro ao buscar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularCustoTotal = (): void => {
    let total = 0
    selectedIngredientes.forEach(sel => {
      const ing = ingredientes.find(i => i.id === sel.ingredienteId)
      if (ing) {
        const precoPorUnidade = ing.preco / ing.quantidade
        total += precoPorUnidade * sel.quantidadeUsada
      }
    })
    setCustoTotal(total)
  }

  const handleAddIngrediente = (ingredienteId: number): void => {
    if (!selectedIngredientes.find(i => i.ingredienteId === ingredienteId)) {
      setSelectedIngredienteIdForQuantidade(ingredienteId)
      setShowQuantidadeDialog(true)
    }
  }

  const handleConfirmQuantidade = (quantidade: number): void => {
    if (selectedIngredienteIdForQuantidade) {
      setSelectedIngredientes([
        ...selectedIngredientes,
        { ingredienteId: selectedIngredienteIdForQuantidade, quantidadeUsada: quantidade }
      ])
      setShowQuantidadeDialog(false)
      setSelectedIngredienteIdForQuantidade(null)
    }
  }

  const handleRemoveIngrediente = (ingredienteId: number): void => {
    setSelectedIngredientes(
      selectedIngredientes.filter(i => i.ingredienteId !== ingredienteId)
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!nomeReceita || selectedIngredientes.length === 0) {
      toastRef.current?.warn('Validação', 'Por favor, preencha o nome da receita e selecione ingredientes')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/receitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeReceita,
          ingredientes: selectedIngredientes
        })
      })

      if (response.ok) {
        setNomeReceita('')
        setSelectedIngredientes([])
        setCustoTotal(0)
        fetchReceitas()
        toastRef.current?.success('Sucesso', 'Receita criada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar receita:', error)
      toastRef.current?.error('Erro', 'Erro ao criar receita')
    } finally {
      setSubmitting(false)
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
          <Icon name="Plus" size={24} />
          <h2>Criar Nova Receita</h2>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nomeReceita">Nome da Receita</label>
              <input
                id="nomeReceita"
                type="text"
                value={nomeReceita}
                onChange={(e) => setNomeReceita(e.target.value)}
                placeholder="Ex: Bolo de Chocolate"
              />
            </div>

            <div className="form-group">
              <label>Selecionar Ingredientes</label>
              <div className="search-box" style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Pesquisar ingrediente..."
                  value={ingredientSearchTerm}
                  onChange={(e) => setIngredientSearchTerm(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {filteredIngredientsForSelection.slice(0, 6).map(ing => (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => handleAddIngrediente(ing.id)}
                    className={selectedIngredientes.find(i => i.ingredienteId === ing.id) ? '' : 'secondary'}
                    style={{ opacity: selectedIngredientes.find(i => i.ingredienteId === ing.id) ? 1 : 0.6 }}
                  >
                    {ing.nome}
                  </button>
                ))}
              </div>
            </div>

            {selectedIngredientes.length > 0 && (
              <div className="form-group">
                <label>Ingredientes Selecionados</label>
                <div className="ingredient-list">
                  {selectedIngredientes.map(sel => {
                    const ing = ingredientes.find(i => i.id === sel.ingredienteId)
                    return (
                      <div key={sel.ingredienteId} className="ingredient-item">
                        <div className="ingredient-item-info">
                          <div className="ingredient-item-name">{ing?.nome}</div>
                          <div className="ingredient-item-details">
                            {sel.quantidadeUsada} unidades
                          </div>
                        </div>
                        <div className="ingredient-item-actions">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngrediente(sel.ingredienteId)}
                            className="danger"
                            title="Remover ingrediente"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{
              backgroundColor: '#f5f1e8',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center',
              border: '2px solid #3d3530'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6b6359' }}>Custo Total da Receita</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#a85c3e' }}>
                R$ {custoTotal.toFixed(2)}
              </h3>
            </div>

            <button type="submit" disabled={submitting || selectedIngredientes.length === 0}>
              {submitting ? 'Criando...' : '✓ Criar Receita'}
            </button>
          </form>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="ClipboardList" size={24} />
          <h2>Receitas Criadas</h2>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando receitas...</p>
          </div>
        ) : receitas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon name="Inbox" size={48} />
            </div>
            <p>Nenhuma receita criada ainda</p>
          </div>
        ) : (
          <div className="grid">
            {receitas.map(receita => (
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

      <QuantidadeDialog
        visible={showQuantidadeDialog}
        ingredienteName={selectedIngredienteIdForQuantidade ? (ingredientes.find(i => i.id === selectedIngredienteIdForQuantidade)?.nome || '') : ''}
        onConfirm={handleConfirmQuantidade}
        onCancel={() => {
          setShowQuantidadeDialog(false)
          setSelectedIngredienteIdForQuantidade(null)
        }}
      />
    </div>
  )
}
