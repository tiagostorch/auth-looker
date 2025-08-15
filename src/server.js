const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do Looker
const LOOKER_HOST = process.env.LOOKER_HOST;
const LOOKER_EMBED_SECRET = process.env.LOOKER_EMBED_SECRET;

// Verificar configurações na inicialização
console.log('🔧 Configurações carregadas:');
console.log(`   - LOOKER_HOST: ${LOOKER_HOST ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   - LOOKER_EMBED_SECRET: ${LOOKER_EMBED_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);

if (!LOOKER_HOST || !LOOKER_EMBED_SECRET) {
  console.error('\n❌ ERRO: Configurações do Looker não encontradas!');
  console.error('   Certifique-se de que o arquivo .env existe e contém:');
  console.error('   - LOOKER_HOST=seu-looker-instance.looker.com');
  console.error('   - LOOKER_EMBED_SECRET=sua-chave-secreta');
  console.error('\n   Copie o arquivo env.example para .env e configure as variáveis.');
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Looker URL Generator API',
    config: {
      lookerHost: LOOKER_HOST ? '✅ Configurado' : '❌ Não configurado',
      lookerSecret: LOOKER_EMBED_SECRET ? '✅ Configurado' : '❌ Não configurado'
    }
  });
});

// Rota principal para gerar URL do Looker
app.post('/generate-looker-url', async (req, res) => {
  try {
    const {
      userId,
      userEmail = '',
      userName = '',
      companyId = 'default_company',
      dashboardId = '3447',
      sessionLength = 3600,
      permissions = ['see_user_dashboards', 'access_data'],
      models = ['default'],
      accessFilters = {}
    } = req.body;

    // Validação básica
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    if (!LOOKER_HOST || !LOOKER_EMBED_SECRET) {
      console.error('Configurações do Looker não encontradas:', { 
        hasHost: !!LOOKER_HOST, 
        hasSecret: !!LOOKER_EMBED_SECRET 
      });
      return res.status(500).json({
        success: false,
        error: 'Configurações do Looker não encontradas',
        message: 'Configure LOOKER_HOST e LOOKER_EMBED_SECRET no arquivo .env'
      });
    }

    // Gerar URL do Looker
    const embedPath = `/login/embed/dashboards/${dashboardId}`;
    const nonce = crypto.randomBytes(16).toString('hex');
    const time = Math.floor(Date.now() / 1000);

    const urlToSign = [
      LOOKER_HOST,
      embedPath,
      nonce,   
      time,
      sessionLength,
      userId,
      JSON.stringify(permissions),
      JSON.stringify(models),
      JSON.stringify(accessFilters)
    ].join('\n');

    const signature = crypto.createHmac('sha256', LOOKER_EMBED_SECRET)
      .update(urlToSign)
      .digest('base64');

    const queryParams = {
      nonce,
      time,
      session_length: sessionLength,
      external_user_id: userId,
      permissions: JSON.stringify(permissions),
      models: JSON.stringify(models),
      access_filters: JSON.stringify(accessFilters),
      force_logout_login: true,
      signature
    };

    const signedUrl = `https://${LOOKER_HOST}${embedPath}?${new URLSearchParams(queryParams).toString()}`;
    
    res.json({ 
      success: true,
      url: signedUrl,
      userId: userId,
      companyId: companyId,
      dashboardId: dashboardId,
      sessionLength: sessionLength
    });

  } catch (error) {
    console.error('Erro ao gerar URL do Looker:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota GET para teste rápido (com parâmetros padrão)
app.get('/generate-looker-url/:userId', (req, res) => {
  const userId = req.params.userId;
  const dashboardId = req.query.dashboardId || '3447';
  const companyId = req.query.companyId || 'default_company';
  
  // Redirecionar para POST com dados padrão
  req.body = {
    userId,
    dashboardId,
    companyId
  };
  
  // Chamar a mesma lógica do POST
  const originalMethod = req.method;
  req.method = 'POST';
  
  app._router.handle(req, res, () => {
    req.method = originalMethod;
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Gerar URL: POST http://localhost:${PORT}/generate-looker-url`);
  console.log(`🔗 Teste rápido: GET http://localhost:${PORT}/generate-looker-url/USER_ID`);
});

module.exports = app;
