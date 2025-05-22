const fs = require('fs');
const axios = require('axios');

const DB_PATH = './usuarios.json';
const CHAVE_GROQ = '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';

function carregarUsuarios() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
  const conteudo = fs.readFileSync(DB_PATH, 'utf8').trim();
  return conteudo ? JSON.parse(conteudo) : {};
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(DB_PATH, JSON.stringify(usuarios, null, 2));
}

function liberarUsuario(numero) {
  const usuarios = carregarUsuarios();
  if (!usuarios[numero]) usuarios[numero] = {};
  usuarios[numero].liberado = true;
  usuarios[numero].etapa = 'final';
  salvarUsuarios(usuarios);
}

async function consultarIA(numero, pergunta) {
  const usuarios = carregarUsuarios();
  const user = usuarios[numero];

  if (!user) return '⚠️ Você ainda não fez a avaliação. Envie "oi" para começar.';

  const prompt = `Você é uma nutricionista virtual. Dados:
Peso: ${user.peso}
Altura: ${user.altura}
Idade: ${user.idade}
Preferências: ${user.preferencias}
Restrições: ${user.restricao}
Saúde: ${user.saude}
Objetivo: ${user.objetivo}

Pergunta: ${pergunta}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'Você é uma nutricionista experiente.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${CHAVE_GROQ}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Erro na IA:', err.message);
    return '❌ Erro na IA. Tente novamente.';
  }
}

module.exports = {
  carregarUsuarios,
  salvarUsuarios,
  liberarUsuario,
  consultarIA
};