export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 1. Pega as variáveis de ambiente e LIMPA espaços/quebras de linha
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, ""); // Remove a barra final se existir
    const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

    console.log('📡 Verificando variáveis: URL length:', supabaseUrl.length, '| Key length:', supabaseKey.length);

    // 2. Verifica se as variáveis existem
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis faltando! URL:', !!supabaseUrl, 'Key:', !!supabaseKey);
      return res.status(500).json({ 
        error: 'Variáveis de ambiente (SUPABASE_URL / SUPABASE_KEY) não configuradas na Vercel.' 
      });
    }

    // 3. PROTEÇÃO CONTRA ERRO 500: Garante que o req.body existe e não é undefined
    const body = req.body || {};
    const { nome, email, telefone } = body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Preencha todos os campos (nome, email, telefone).' });
    }

    console.log('📝 Dados recebidos:', { nome, email, telefone });
    console.log('📡 Enviando para:', `${supabaseUrl}/rest/v1/clientes`);

    // 4. Chama o Supabase via fetch direto
    const response = await fetch(`${supabaseUrl}/rest/v1/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ nome, email, telefone })
    });

    console.log('📥 Status da resposta do Supabase:', response.status);

    // 5. Se o Supabase retornar erro (ex: tabela não existe, RLS bloqueou)
    if (!response.ok) {
      // Lê o texto do erro para logar corretamente
      const errorText = await response.text();
      console.error('❌ Erro do Supabase:', errorText);
      
      // Tenta transformar o erro em JSON para o frontend entender
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        errorJson = { message: errorText };
      }

      return res.status(response.status).json({ 
        error: 'Erro no banco de dados: ' + (errorJson.message || errorJson.error || 'Desconhecido') 
      });
    }

    // 6. Sucesso
    const data = await response.json();
    console.log('✅ Cliente cadastrado com sucesso:', data);
    
    return res.status(200).json({ sucesso: true, dados: data });

  } catch (error) {
    // 7. Captura qualquer erro catastrófico (ex: falta de internet no servidor, erro de sintaxe)
    console.error('💥 Erro interno não tratado:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Erro interno no servidor: ' + error.message 
    });
  }
}