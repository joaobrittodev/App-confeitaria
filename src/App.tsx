import { useState, ReactNode } from 'react'
import Home from './pages/Home'
import Ingredientes from './pages/Ingredientes'
import Receitas from './pages/Receitas'
import ReceitaDetail from './pages/ReceitaDetail'

export type PageType = 'home' | 'ingredientes' | 'receitas' | 'detail'

export interface NavigateParams {
  page: PageType
  receitaId?: number
}

export default function App(): ReactNode {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [selectedReceitaId, setSelectedReceitaId] = useState<number | null>(null)

  const handleNavigate = (params: NavigateParams): void => {
    setCurrentPage(params.page)
    if (params.receitaId) {
      setSelectedReceitaId(params.receitaId)
    }
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon"></span>
            <div className="logo-text">
              <h1>Cali Britto Confeitaria</h1>
              <p>Gerenciador de Receitas</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleNavigate({ page: 'home' })}>
              Inicio
            </button>
            <button onClick={() => handleNavigate({ page: 'ingredientes' })}>
              Ingredientes
            </button>
            <button onClick={() => handleNavigate({ page: 'receitas' })}>
              Receitas
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {currentPage === 'home' && (
          <Home onNavigate={handleNavigate} />
        )}
        {currentPage === 'ingredientes' && (
          <Ingredientes />
        )}
        {currentPage === 'receitas' && (
          <Receitas onNavigate={handleNavigate} />
        )}
        {currentPage === 'detail' && selectedReceitaId && (
          <ReceitaDetail 
            receitaId={selectedReceitaId} 
            onBack={() => handleNavigate({ page: 'home' })}
          />
        )}
      </div>
    </div>
  )
}
