
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const storage = multer.diskStorage({
destination: function (req, file, cb) {
  const { data, responsavel, chassi } = req.body;

  if (!data || !responsavel || !chassi) {
    return cb(new Error('Campos obrigatórios não preenchidos.'));
  }

  const dataParts = data.split('-'); 
  const ano = dataParts[0];
  const mes = dataParts[1];
  const dia = dataParts[2];

  const mesExtenso = `${meses[parseInt(mes, 10) - 1]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  // // Teste local 
  
  // const folderPath = path.join(
  //   'C:',
  //   'Users',
  //   'Cleyton Lima',
  //   'Downloads',
  //   'Uploads',
  //   mesExtenso,
  //   diaMes,
  //   chassi,
  //   responsavel
  // );

  // Servidor 

  const folderPath = path.join(
    'Y:',
    'Fotos Pré embarque - 2025',
    'Embarques',
    mesExtenso,
    diaMes,
    chassi,
    responsavel
  );
  

  fs.mkdirSync(folderPath, { recursive: true });
  cb(null, folderPath);
},

  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const newName = `${timestamp}_${file.originalname}`;
    cb(null, newName);
  }
});



const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.array('files', 350), (req, res) => {
  res.send('✅ Upload concluído com sucesso!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
