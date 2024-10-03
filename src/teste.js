const wavPlayer = require('node-wav-player');
const path = require('path');

// Caminho para o arquivo de som
const soundPath = path.join(__dirname, 'midias', 'LYNC_videocall.wav');



wavPlayer.play({
  path: soundPath,
}).then(() => {
  console.log('Som reproduzido com sucesso!');
}).catch(error => {
  console.error(`Erro ao reproduzir o som: ${error.message}`);
});
