// Importa o cliente Supabase para Node.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega as variáveis de ambiente
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // Verifica se as variáveis existem
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente faltando!');
      return res.status(500).json({ 
        error: 'Configuração do servidor incompleta' 
      });
    }

    // Cria o cliente Supabase (biblioteca oficial)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pega os dados do corpo da requisição
    const { nome, email, telefone } = req.body;

    // Validação
    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    console.log(' Salvando cliente:', { nome, email, telefone });

    // Insere na tabela 'clientes'
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, email, telefone }]);

    // Verifica se deu erro
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      return res.status(500).json({ 
        error: 'Erro ao salvar: ' + error.message 
      });
    }

    console.log('✅ Cliente salvo com sucesso!', data);
    return res.status(200).json({ 
      sucesso: true, 
      mensagem: 'Cliente cadastrado com sucesso!',
      dados: data 
    });

  } catch (erro) {
    console.error('💥 Erro inesperado:', erro);
    return res.status(500).json({ 
      error: 'Erro interno: ' + erro.message 
    });
  }
}