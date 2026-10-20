export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, "");
    const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Variáveis de ambiente não configuradas na Vercel.' });
    }

    const body = req.body || {};
    const { nome, email, telefone } = body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ nome: nome, email, telefone })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Erro do banco: ' + errorText });
    }

    const data = await response.json();
    return res.status(200).json({ sucesso: true, dados: data });

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
}
