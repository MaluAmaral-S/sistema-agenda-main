# Projeto AgendaPro - Sistema de Agendamentos

Sistema completo de agendamentos com frontend React e backend Node.js + PostgreSQL.

## Estrutura do Projeto

```
projeto-integrado/
├── backend (Node.js + Express + Sequelize)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/ (React + Vite)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── package.json
    └── vite.config.js
```

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- npm ou yarn

## Configuração do Banco de Dados

1. Instale o PostgreSQL
2. Crie um banco de dados chamado `agendamentos_db`
3. Configure as credenciais no arquivo `.env`

## Como Executar

### 1. Backend (Terminal 1)

```bash
cd projeto-integrado
npm install
npm run dev
```

O backend estará rodando em: http://localhost:3000

### 2. Frontend (Terminal 2)

```bash
cd projeto-integrado/frontend
npm install --legacy-peer-deps
npm run dev
```

O frontend estará rodando em: http://localhost:5173

## Funcionalidades

- ✅ Autenticação de usuários (login/registro)
- ✅ Gerenciamento de serviços
- ✅ Configuração de horários de funcionamento
- ✅ Dashboard administrativo
- ✅ Interface responsiva

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT para autenticação
- bcryptjs para hash de senhas

### Frontend
- React 19
- Vite
- Tailwind CSS
- Shadcn/ui
- Axios
- React Router DOM
- Lucide React (ícones)

## Variáveis de Ambiente

Certifique-se de configurar o arquivo `.env` na raiz do projeto:

```env
DB_NAME=agendamentos_db
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Autenticação
- POST `/api/auth/register` - Registro de usuário
- POST `/api/auth/login` - Login de usuário
- POST `/api/auth/logout` - Logout de usuário

### Serviços
- GET `/api/servicos` - Listar serviços
- POST `/api/servicos` - Criar serviço
- PUT `/api/servicos/:id` - Atualizar serviço
- DELETE `/api/servicos/:id` - Deletar serviço

### Horários de Funcionamento
- GET `/api/business-hours` - Obter horários
- PUT `/api/business-hours` - Atualizar horários

## Desenvolvimento

Para desenvolvimento, execute ambos os servidores simultaneamente:
- Backend: `npm run dev` (porta 3000)
- Frontend: `npm run dev` (porta 5173)

O frontend está configurado para fazer requisições para o backend na porta 3000.

