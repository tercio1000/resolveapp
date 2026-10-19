export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega as variáveis de ambiente e LIMPA espaços/quebras de linha
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

    console.log('URL length:', supabaseUrl.length, '| Key length:', supabaseKey.length);

    // Verifica se as variáveis existem
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis faltando! URL:', !!supabaseUrl, 'Key:', !!supabaseKey);
      return res.status(500).json({ 
        error: 'Variáveis de ambiente não configuradas' 
      });
    }

    // Pega os dados do corpo
    const { nome, email, telefone } = req.body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    console.log('📝 Dados:', { nome, email, telefone });
    console.log('📡 URL final:', supabaseUrl + '/rest/v1/clientes');

    // Chama o Supabase via fetch direto (sem biblioteca)
    const response = await fetch(supabaseUrl + '/rest/v1/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ nome, email, telefone })
    });

    console.log('📥 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro Supabase:', errorText);
      return res.status(response.status).json({ 
        error: 'Erro do Supabase: ' + errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Sucesso:', data);
    return res.status(200).json({ sucesso: true, dados: data });

  } catch (error) {
    console.error('💥 Erro:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Erro interno: ' + error.message 
    });
  }
}