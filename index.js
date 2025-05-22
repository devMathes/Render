const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const DB_PATH = './usuarios.json';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

function carregarUsuarios() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
  const conteudo = fs.readFileSync(DB_PATH, 'utf8').trim();
  return conteudo ? JSON.parse(conteudo) : {};
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(DB_PATH, JSON.stringify(usuarios, null, 2));
}

app.post('/webhook', (req, res) => {
  try {
    const data = req.body;
    console.log('Recebido webhook:', data);

    if (data.status === 'approved' && data.telefone) {
      const usuarios = carregarUsuarios();
      const numero = `${data.telefone}@c.us`;

      if (usuarios[numero]) {
        usuarios[numero].liberado = true;
        salvarUsuarios(usuarios);
        console.log(`Usuário ${numero} liberado com sucesso.`);
        return res.status(200).json({ message: 'Usuário liberado' });
      } else {
        console.log(`Usuário ${numero} não encontrado.`);
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } else {
      return res.status(400).json({ message: 'Dados incompletos ou pagamento não aprovado' });
    }
  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

app.listen(PORT, () => console.log(`Webhook rodando na porta ${PORT}`));