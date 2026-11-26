
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
  console.error('Variáveis do Supabase não configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUILD_ID = 'KEYVAULT-DIAGNOSTICO-261126';

app.get('/', (req, res) => {
  res.json({
    message: 'API da KeyVault funcionando!',
    build: BUILD_ID
  });
});

app.get('/__diagnostico', (req, res) => {
  res.json({
    status: 'OK',
    build: BUILD_ID,
    catalogRoute: 'registered'
  });
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

    if (error) {
      console.error('Erro Supabase:', error);
      return res.status(500).json({
        error: 'Erro ao carregar catálogo.',
        details: error.message
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({
      error: 'Erro interno.',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`KeyVault API rodando na porta ${PORT}`);
  console.log(`Build: ${BUILD_ID}`);
});
