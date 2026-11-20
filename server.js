
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.SITE_ORIGIN || '*'
}));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Configure as variáveis do Supabase.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.json({ message: 'API da KeyVault funcionando!' });
});

app.get('/api/catalog', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kv_offers')
      .select(`
        id,
        price,
        currency,
        region,
        platform,
        url,
        kv_games (id, title),
        kv_stores (id, name)
      `);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar catálogo.' });
  }
});

app.listen(PORT, () => {
  console.log(`KeyVault API rodando na porta ${PORT}`);
});
