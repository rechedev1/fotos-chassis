const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Armazenamento temporário
const tempStorage = multer.memoryStorage();
const tempUpload = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/upload", tempUpload.array("files", 350), (req, res) => {
  const { data, responsavel, chassi, tipo } = req.body;

  if (!data || !responsavel || !chassi || !tipo) {
    return res.status(400).send("❌ Campos obrigatórios não preenchidos.");
  }

  const [ano, mes, dia] = data.split("-");
  const mesIndex = parseInt(mes, 10) - 1;
  const mesExtenso = `${meses[mesIndex]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  // const basePath = path.join(
  //   "C:",
  //   "Users",
  //   "Cleyton Lima",
  //   "Downloads",
  //   "Uploads",
  //   mesExtenso,
  //   diaMes,
  //   chassi,
  //   tipo
  // );

  // Servidor

  const basePath = path.join(
    "Y:",
    "Fotos Pré embarque - 2025",
    "Embarques",
    mesExtenso,
    diaMes,
    chassi,
    tipo,
    responsavel
  );

  // Verificação de duplicidade: se qualquer pasta dentro de chassi/tipo contém arquivos
  if (fs.existsSync(basePath)) {
    const subPastas = fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const pasta of subPastas) {
      const arquivos = fs.readdirSync(path.join(basePath, pasta.name));
      if (arquivos.length > 0) {
        return res
          .status(409)
          .send("❌ Já existe inspeção para esse chassi e tipo.");
      }
    }
  }

  // Caminho final com o nome do inspetor
  const finalFolder = path.join(basePath, responsavel);
  fs.mkdirSync(finalFolder, { recursive: true });

  req.files.forEach((file) => {
    const timestamp = Date.now();
    const newName = `${timestamp}_${file.originalname}`;
    fs.writeFileSync(path.join(finalFolder, newName), file.buffer);
  });

  res.send("✅ Upload concluído com sucesso!");
});

app.post("/verificar", express.json(), (req, res) => {
  const { data, chassi, tipo } = req.body;

  if (!data || !chassi || !tipo) {
    return res
      .status(400)
      .json({ duplicado: false, erro: "Campos incompletos" });
  }

  const [ano, mes, dia] = data.split("-");
  const mesIndex = parseInt(mes, 10) - 1;
  const mesExtenso = `${meses[mesIndex]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  // Verificar chassi - servidor de teste

  // const basePath = path.join(
  //   "C:",
  //   "Users",
  //   "Cleyton Lima",
  //   "Downloads",
  //   "Uploads",
  //   mesExtenso,
  //   diaMes,
  //   chassi,
  //   tipo
  // );

  // Verificar chassi - Servidor
  const basePath = path.join(
    "Y:",
    "Fotos Pré embarque - 2025",
    "Embarques",
    mesExtenso,
    diaMes,
    chassi,
    tipo,
    responsavel
  );

  if (fs.existsSync(basePath)) {
    const subPastas = fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());
    for (const pasta of subPastas) {
      const arquivos = fs.readdirSync(path.join(basePath, pasta.name));
      if (arquivos.length > 0) {
        return res.json({ duplicado: true });
      }
    }
  }

  return res.json({ duplicado: false });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
