import { useState, useEffect, ReactNode } from 'react'
import Icon from '../components/Icon'

interface IngredienteComQuantidade {
  id: number
  nome: string
  quantidade: number
  preco: number
  quantidadeUsada: number
  criadoEm: string
}

interface Receita {
  id: number
  nomeReceita: string
  custoTotal: number
  criadoEm: string
  ingredientes: IngredienteComQuantidade[]
}

interface ReceitaDetailProps {
  receitaId: number
  onBack: () => void
}

export default function ReceitaDetail({ receitaId, onBack }: ReceitaDetailProps): ReactNode {
  const [receita, setReceita] = useState<Receita | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchReceitaDetail()
  }, [receitaId])

  const fetchReceitaDetail = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/receitas/${receitaId}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Erro ${response.status}:`, errorData)
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      const data: Receita = await response.json()
      setReceita(data)
    } catch (error) {
      console.error('❌ Erro ao buscar receita:', error)
      alert(`Erro ao carregar receita: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando receita...</p>
      </div>
    )
  }

  if (!receita) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Icon name="AlertCircle" size={48} />
        </div>
        <p>Receita não encontrada</p>
        <button onClick={onBack}>← Voltar</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '2rem' }}>
        ← Voltar
      </button>

      <section>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{receita.nomeReceita}</h2>
              <p style={{ margin: 0, color: '#6b6359' }}>
                Criada em {new Date(receita.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="recipe-cost" style={{ fontSize: '1.2rem', padding: '1rem 1.5rem' }}>
              R$ {parseFloat(String(receita.custoTotal)).toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="Package" size={24} />
          <h2>Ingredientes</h2>
        </div>
        
        {receita.ingredientes && receita.ingredientes.length > 0 ? (
          <div className="ingredient-list">
            {receita.ingredientes.map((ing, idx) => {
              const precoPorUnidade = ing.preco / ing.quantidade
              const custoIngrediente = precoPorUnidade * ing.quantidadeUsada
              
              return (
                <div key={idx} className="ingredient-item">
                  <div className="ingredient-item-info">
                    <div className="ingredient-item-name">{ing.nome}</div>
                    <div className="ingredient-item-details">
                      Quantidade usada: {ing.quantidadeUsada}g/ml
                      <br />
                      Preço unitário: R$ {precoPorUnidade.toFixed(2)}/unidade
                      <br />
                      <strong>Custo: R$ {custoIngrediente.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>Nenhum ingrediente nesta receita</p>
          </div>
        )}

        <section style={{ marginTop: '3rem' }}>
          <div className="card" style={{ 
            backgroundColor: '#f5f1e8', 
            textAlign: 'center',
            padding: '2rem'
          }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#6b6359' }}>
              💰 Custo Total da Receita
            </p>
            <h2 style={{ 
              margin: 0, 
              fontSize: '3rem', 
              color: '#a85c3e',
              fontFamily: 'var(--font-script)'
            }}>
              R$ {parseFloat(String(receita.custoTotal)).toFixed(2)}
            </h2>
          </div>
        </section>

        {receita.ingredientes && receita.ingredientes.length > 0 && (
          <section style={{ marginTop: '3rem' }}>
            <h2>📊 Breakdown de Custos</h2>
            <div className="card">
              <div style={{ display: 'grid', gap: '1rem' }}>
                {receita.ingredientes.map((ing, idx) => {
                  const precoPorUnidade = ing.preco / ing.quantidade
                  const custoIngrediente = precoPorUnidade * ing.quantidadeUsada
                  const percentual = (custoIngrediente / receita.custoTotal * 100).toFixed(1)
                  
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #3d3530'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {ing.nome}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b6359' }}>
                          {percentual}% do custo total
                        </p>
                      </div>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#a85c3e' }}>
                        R$ {custoIngrediente.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </section>
    </div>
  )
}
