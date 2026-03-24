# App-confeitaria

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)
![Linguagens](https://img.shields.io/badge/Stack-React%20%2B%20Node-orange?style=for-the-badge)
![Dependências](https://img.shields.io/badge/npm-Recipe%20Manager-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/license/mit)

> App-confeitaria é um painel completo para confeiteiras e confeiteiros planejarem receitas, calcular custos e manter o estoque de ingredientes sincronizado com uma API Node/Express conectada ao MySQL.

### Ajustes e melhorias

O projeto está em constante evolução. As próximas entregas previstas incluem:

- [x] Aprimorar Visualização de Dispositivos Moveis na Criação de Receita
- [x] Colocar opção de unidade no cadastro de ingredientes
- [x] Opção de Pesquisar Ingredientes na aba de Criação de Receitas
- [ ] Tela de autenticação(cadastro, login, recuperar senha)
- [ ] Receitas(Descrição e quem criou a receita)
- [ ] Personalização de perfil(porcentagem de mão de obra e meios de contato) 
- [ ] Perfil de usuario(Meios de contato, Receitas criadas pelo usuario)

## 💻 Pré-requisitos

Antes de começar, certifique-se de ter:

- `Node.js` 18 ou superior
- `npm` 9 ou superior
- Um servidor `MySQL 8+` acessível (local ou remoto)
- Um arquivo `.env` na raiz com as variáveis do servidor (ver exemplo abaixo)

### Exemplo de `.env`

```
SERVER_PORT=3333
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senha-segura
DB_NAME=confeitaria
DB_PORT=3306
```

## 🚀 Instalando App-confeitaria

Instale as dependências com o npm. O comando é o mesmo em Linux/macOS e Windows:

```
npm install
```

Em seguida, crie o `.env` (copiando o template acima) e personalize as credenciais do banco de dados.

## ☕ Usando App-confeitaria

### Ambiente de desenvolvimento

- `npm run dev` — inicia o backend (Express + MySQL) e o frontend (Vite + React 19) em paralelo.
- `npm run dev:server` — sobe apenas o servidor Express (usa `.env` para portas e conexão).
- `npm run dev:client` — inicia apenas o Vite (frontend disponível em `http://localhost:5173`).

O backend responde em `http://localhost:<SERVER_PORT>/api` (3333 por padrão) enquanto o cliente consome as rotas `/api/ingredientes` e `/api/receitas`.

### Build e deploy

- `npm run build` — gera o bundle do frontend em `dist/`.
- `npm run preview` — serve a build produzida em modo preview.
- `npm run start` — inicia o servidor Express apontando para `dist/server.js`.
- `npm run type-check` — executa o TypeScript para garantir tipagens válidas antes de commits.

### Fluxos principais da aplicação

1. Navegue entre `Início`, `Ingredientes` e `Receitas` pelo cabeçalho.
2. Na página de ingredientes você cadastra novas matérias-primas, exclui entradas e vê a lista em tempo real.
3. Em Receitas, escolha ingredientes existentes, ajuste quantidades e grave o custo total calculado automaticamente.
4. O painel inicial permite pesquisar receitas, visualizar cards (com custo por receita) e acessar os detalhes individuais.
5. Na tela de detalhes é possível consultar ingredientes, custo por item e o percentual que cada insumo representa no custo total.

### API principal

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/ingredientes` | Lista ingredientes ordenados por criação. |
| `POST` | `/api/ingredientes` | Adiciona um ingrediente com nome, quantidade e preço. |
| `DELETE` | `/api/ingredientes/:id` | Remove um ingrediente e as dependências. |
| `GET` | `/api/receitas` | Lista receitas registradas. |
| `GET` | `/api/receitas/search/:nome` | Busca receitas por fragmento no nome. |
| `GET` | `/api/receitas/:id` | Retorna receita completa com ingredientes e custo. |
| `POST` | `/api/receitas` | Cria uma receita com lista de ingredientes e cálculos automáticos. |
| `DELETE` | `/api/receitas/:id` | Remove receita e registros ligados. |

## 📫 Contribuindo

1. Dê um fork neste repositório.
2. Crie um branch com a nova feature ou correção (`git checkout -b feature/minha-melhoria`).
3. Faça as alterações, rode `npm run type-check` e confirme (`git commit -m "feat: descrição"`).
4. Envie para o seu fork (`git push origin feature/minha-melhoria`).
5. Abra uma pull request descrevendo o fluxo e o cenário coberto.

Use as Issues para sugerir melhorias, relatar bugs ou alinhar novas funcionalidades antes de começar a implementação.

## 🤝 Colaboradores

Agradecimentos especiais aos colaboladores que já colocaram as mãos no código:

<table>
  <tr>
    <td align="center">
      <sub><b>João Victor(creator)</b></sub><br>
      <a href="https://github.com/joaobrittodev">João Victor</a>
    </td>
  </tr>
</table>

## 😄 Seja um dos contribuidores

Quer estender o App-confeitaria? Abra uma issue em `https://github.com/joaobrittodev/App-confeitaria/issues` e conte qual valor essa melhoria traria.
