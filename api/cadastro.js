// API Route da Vercel - Age como "ponte" entre o site e o Supabase
// O navegador fala com a Vercel (sem bloqueio), e a Vercel fala com o Supabase (sem bloqueio)

export default async function handler(req, res) {
  // Só aceita requisições POST (mais seguro)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega os dados que o site enviou
    const { nome, email, telefone } = req.body;

    // Validação básica
    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    // Pega as chaves do cofre da Vercel (Variáveis de Ambiente)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // Faz a requisição direto para o Supabase (de dentro da Vercel, sem bloqueio!)
    const resposta = await fetch(`${supabaseUrl}/rest/v1/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ nome, email, telefone })
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error('Erro do Supabase:', erro);
      return res.status(500).json({ error: 'Erro ao salvar no banco' });
    }

    const dados = await resposta.json();
    console.log('✅ Cliente salvo:', dados);

    return res.status(200).json({ 
      sucesso: true, 
      mensagem: 'Cliente cadastrado com sucesso!',
      dados: dados 
    });

  } catch (erro) {
    console.error('Erro na API:', erro);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}