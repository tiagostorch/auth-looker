// Exemplo de como testar a API
// Para Node.js < 18, instale: npm install node-fetch

async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Teste 1: Health check
    console.log('🔍 Testando health check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Teste 2: Gerar URL do Looker (POST)
    console.log('\n🔗 Testando geração de URL (POST)...');
    const postResponse = await fetch(`${baseUrl}/generate-looker-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        userEmail: 'test@example.com',
        userName: 'Usuário Teste',
        companyId: 'test-company',
        dashboardId: '3447',
        sessionLength: 3600,
        permissions: ['see_user_dashboards', 'access_data'],
        models: ['default'],
        accessFilters: {}
      })
    });
    
    const postData = await postResponse.json();
    console.log('POST Response:', postData);
    
    // Teste 3: Gerar URL do Looker (GET - teste rápido)
    console.log('\n🔗 Testando geração de URL (GET)...');
    const getResponse = await fetch(`${baseUrl}/generate-looker-url/test-user-456?dashboardId=3447&companyId=test-company-2`);
    const getData = await getResponse.json();
    console.log('GET Response:', getData);
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

// Executar teste se o arquivo for executado diretamente
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
