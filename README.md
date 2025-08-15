# API Looker URL Generator

API simples em Node.js para gerar URLs assinadas do Looker Embed.

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env` com suas configurações do Looker:
```env
PORT=3000
NODE_ENV=development
LOOKER_HOST=your-looker-instance.looker.com
LOOKER_EMBED_SECRET=your-looker-embed-secret
```

## 🏃‍♂️ Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints

### Health Check
```
GET /health
```

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Looker URL Generator API"
}
```

### Gerar URL do Looker (POST)
```
POST /generate-looker-url
```

**Body:**
```json
{
  "userId": "user123",
  "userEmail": "user@example.com",
  "userName": "João Silva",
  "companyId": "company123",
  "dashboardId": "3447",
  "sessionLength": 3600,
  "permissions": ["see_user_dashboards", "access_data"],
  "models": ["default"],
  "accessFilters": {}
}
```

**Resposta:**
```json
{
  "success": true,
  "url": "https://your-looker-instance.looker.com/login/embed/dashboards/3447?...",
  "userId": "user123",
  "companyId": "company123",
  "dashboardId": "3447",
  "sessionLength": 3600
}
```

### Teste Rápido (GET)
```
GET /generate-looker-url/:userId?dashboardId=3447&companyId=company123
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `PORT` | Porta do servidor | Não (padrão: 3000) |
| `NODE_ENV` | Ambiente (development/production) | Não |
| `LOOKER_HOST` | Host do Looker (sem https://) | Sim |
| `LOOKER_EMBED_SECRET` | Chave secreta do Looker Embed | Sim |

### Parâmetros da API

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `userId` | string | - | ID do usuário (obrigatório) |
| `userEmail` | string | "" | Email do usuário |
| `userName` | string | "" | Nome do usuário |
| `companyId` | string | "default_company" | ID da empresa |
| `dashboardId` | string | "3447" | ID do dashboard |
| `sessionLength` | number | 3600 | Duração da sessão em segundos |
| `permissions` | array | ["see_user_dashboards", "access_data"] | Permissões do usuário |
| `models` | array | ["default"] | Modelos de dados |
| `accessFilters` | object | {} | Filtros de acesso |

## 📝 Exemplos de Uso

### cURL
```bash
# POST com dados completos
curl -X POST http://localhost:3000/generate-looker-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "dashboardId": "3447",
    "companyId": "company123"
  }'

# GET para teste rápido
curl http://localhost:3000/generate-looker-url/user123?dashboardId=3447
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/generate-looker-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user123',
    dashboardId: '3447',
    companyId: 'company123'
  })
});

const data = await response.json();
console.log(data.url);
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com hot reload
- `npm test` - Executa os testes

### Estrutura do Projeto

```
├── src/
│   └── server.js          # Servidor principal
├── package.json           # Dependências e scripts
├── env.example           # Exemplo de variáveis de ambiente
└── README.md             # Documentação
```

## 🔒 Segurança

- A API usa Helmet para headers de segurança
- CORS configurado para permitir requisições cross-origin
- Validação básica de parâmetros obrigatórios
- Logs de todas as requisições

## 🐛 Troubleshooting

### Erro: "Configurações do Looker não encontradas"
Verifique se as variáveis `LOOKER_HOST` e `LOOKER_EMBED_SECRET` estão configuradas no arquivo `.env`.

### Erro: "userId é obrigatório"
Certifique-se de enviar o `userId` no body da requisição POST.

### Porta já em uso
Altere a variável `PORT` no arquivo `.env` ou use uma porta diferente.
