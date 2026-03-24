import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.SERVER_PORT;

// Middleware
app.use(cors());
app.use(express.json());


interface Receita {
  id: number;
  nomeReceita: string;
  custoTotal: number;
  criadoEm: string;
}


// Pool de conexão MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Inicializar banco de dados
async function initializeDatabase(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    
    // Criar tabela de ingredientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ingredientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        quantidade DECIMAL(10, 2) NOT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de receitas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS receitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomeReceita VARCHAR(255) NOT NULL,
        custoTotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
        criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de relação receita-ingredientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS receita_ingredientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receitaId INT NOT NULL,
        ingredienteId INT NOT NULL,
        quantidadeUsada DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (receitaId) REFERENCES receitas(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredienteId) REFERENCES ingredientes(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('✓ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('✗ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

// ==================== ROTAS DE INGREDIENTES ====================

// GET - Listar todos os ingredientes
app.get('/api/ingredientes', async (_req: Request, res: Response): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    const [ingredientes] = await connection.execute(
      'SELECT * FROM ingredientes ORDER BY criadoEm DESC'
    );
    connection.release();
    const formatted = (ingredientes as any[]).map(ing => ({
      id: ing.id,
      nome: ing.nome,
      quantidade: ing.quantidade,
      preco: ing.preco,
      criadoEm: ing.criadoEm
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Erro ao listar ingredientes:', error);
    res.status(500).json({ error: 'Erro ao listar ingredientes' });
  }
});

// POST - Criar novo ingrediente
app.post('/api/ingredientes', async (req: Request, res: Response): Promise<void> => {
  const { nome, quantidade, preco } = req.body;

  if (!nome || !quantidade || !preco) {
    res.status(400).json({ error: 'Campos obrigatórios faltando' });
    return;
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO ingredientes (nome, quantidade, preco) VALUES (?, ?, ?)',
      [nome, quantidade, preco]
    );
    connection.release();
    
    const insertResult = result as any;
    res.status(201).json({
      id: insertResult.insertId,
      nome,
      quantidade,
      preco,
    });
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error);
    res.status(500).json({ error: 'Erro ao criar ingrediente' });
  }
});

// DELETE - Deletar ingrediente
app.delete('/api/ingredientes/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM ingredientes WHERE id = ?', [id]);
    connection.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar ingrediente:', error);
    res.status(500).json({ error: 'Erro ao deletar ingrediente' });
  }
});

// ==================== ROTAS DE RECEITAS ====================

// GET - Listar todas as receitas
app.get('/api/receitas', async (_req: Request, res: Response): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    const [receitas] = await connection.execute(
      'SELECT * FROM receitas ORDER BY criadoEm DESC'
    );
    connection.release();
    const formatted = (receitas as any[]).map(r => ({
      id: r.id,
      nomeReceita: r.nomeReceita,
      custoTotal: r.custoTotal,
      criadoEm: r.criadoEm
    }));
    console.log('📋 Receitas fetched:', formatted);
    res.json(formatted);
  } catch (error) {
    console.error('❌ Erro ao listar receitas:', error);
    res.status(500).json({ error: 'Erro ao listar receitas', details: String(error) });
  }
});

// GET - Buscar receita por nome
app.get('/api/receitas/search/:nome', async (req: Request, res: Response): Promise<void> => {
  const { nome } = req.params;

  try {
    const connection = await pool.getConnection();
    const [receitas] = await connection.execute(
      'SELECT * FROM receitas WHERE nomeReceita LIKE ? ORDER BY criadoEm DESC',
      [`%${nome}%`]
    );
    connection.release();
    const formatted = (receitas as any[]).map(r => ({
      id: r.id,
      nomeReceita: r.nomeReceita,
      custoTotal: r.custoTotal,
      criadoEm: r.criadoEm
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});

// GET - Obter receita com ingredientes
app.get('/api/receitas/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    const [receitas] = await connection.execute(
      'SELECT * FROM receitas WHERE id = ?',
      [id]
    );

    if ((receitas as any[]).length === 0) {
      connection.release();
      res.status(404).json({ error: 'Receita não encontrada' });
      return;
    }

    const [ingredientes] = await connection.execute(`
      SELECT i.*, ri.quantidadeUsada
      FROM receita_ingredientes ri
      JOIN ingredientes i ON ri.ingredienteId = i.id
      WHERE ri.receitaId = ?
    `, [id]);

    connection.release();

    const receita = (receitas as any[])[0];
    res.json({
      id: receita.id,
      nomeReceita: receita.nomeReceita,
      custoTotal: receita.custoTotal,
      criadoEm: receita.criadoEm,
      ingredientes: (ingredientes as any[]).map(ing => ({
        id: ing.id,
        nome: ing.nome,
        quantidade: ing.quantidade,
        preco: ing.preco,
        quantidadeUsada: ing.quantidadeUsada,
        criadoEm: ing.criadoEm
      }))
    });
  } catch (error) {
    console.error('Erro ao obter receita:', error);
    res.status(500).json({ error: 'Erro ao obter receita' });
  }
});

// POST - Criar nova receita
app.post('/api/receitas', async (req: Request, res: Response): Promise<void> => {
  const { nomeReceita, ingredientes } = req.body;

  if (!nomeReceita || !ingredientes || ingredientes.length === 0) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  try {
    const connection = await pool.getConnection();

    // Calcular custo total
    let custoTotal = 0;
    for (const ing of ingredientes) {
      const [ingrediente] = await connection.execute(
        'SELECT preco, quantidade FROM ingredientes WHERE id = ?',
        [ing.ingredienteId]
      );
      if ((ingrediente as any[]).length > 0) {
        const precoPorUnidade = (ingrediente as any[])[0].preco / (ingrediente as any[])[0].quantidade;
        custoTotal += precoPorUnidade * ing.quantidadeUsada;
      }
    }

    // Inserir receita
    const [result] = await connection.execute(
      'INSERT INTO receitas (nomeReceita, custoTotal) VALUES (?, ?)',
      [nomeReceita, custoTotal]
    );

    const insertResult = result as any;
    const receitaId = insertResult.insertId;

    // Inserir ingredientes da receita
    for (const ing of ingredientes) {
      await connection.execute(
        'INSERT INTO receita_ingredientes (receitaId, ingredienteId, quantidadeUsada) VALUES (?, ?, ?)',
        [receitaId, ing.ingredienteId, ing.quantidadeUsada]
      );
    }

    connection.release();

    res.status(201).json({
      id: receitaId,
      nomeReceita,
      custoTotal,
      ingredientes,
    });
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    res.status(500).json({ error: 'Erro ao criar receita' });
  }
});

// PATCH - Editar receita
app.patch('/api/receitas/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nomeReceita, ingredientes } = req.body;

  if (!nomeReceita || !ingredientes || ingredientes.length === 0) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  try {
    const connection = await pool.getConnection();

    // Calcular custo total
    let custoTotal = 0;
    for (const ing of ingredientes) {
      const [ingrediente] = await connection.execute(
        'SELECT preco, quantidade FROM ingredientes WHERE id = ?',
        [ing.ingredienteId]
      );
      if ((ingrediente as any[]).length > 0) {
        const precoPorUnidade = (ingrediente as any[])[0].preco / (ingrediente as any[])[0].quantidade;
        custoTotal += precoPorUnidade * ing.quantidadeUsada;
      }
    }

    // Atualizar receita
    await connection.execute(
      'UPDATE receitas SET nomeReceita = ?, custoTotal = ? WHERE id = ?',
      [nomeReceita, custoTotal, id]
    );

    // Deletar ingredientes antigos
    await connection.execute(
      'DELETE FROM receita_ingredientes WHERE receitaId = ?',
      [id]
    );

    // Inserir novos ingredientes
    for (const ing of ingredientes) {
      await connection.execute(
        'INSERT INTO receita_ingredientes (receitaId, ingredienteId, quantidadeUsada) VALUES (?, ?, ?)',
        [id, ing.ingredienteId, ing.quantidadeUsada]
      );
    }

    connection.release();

    res.json({
      id,
      nomeReceita,
      custoTotal,
      ingredientes,
    });
  } catch (error) {
    console.error('Erro ao editar receita:', error);
    res.status(500).json({ error: 'Erro ao editar receita' });
  }
});

// DELETE - Deletar receita
app.delete('/api/receitas/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM receitas WHERE id = ?', [id]);
    connection.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    res.status(500).json({ error: 'Erro ao deletar receita' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ status: 'OK' });
});

// Iniciar servidor
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🍳 Recipe Manager Backend rodando em http://localhost:${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api\n`);
  });
});
