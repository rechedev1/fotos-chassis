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

// Caminho principal de upload
const baseUploadPath = path.join(
  "Y:",
  "Fotos Pré embarque - 2025",
  "Embarques"
);

//  Caminho para testes locais
// const baseUploadPath = path.join(
//   "C:",
//   "Users",
//   "Cleyton Lima",
//   "Downloads",
//   "Uploads"
// );

// Armazenamento temporário
const tempStorage = multer.memoryStorage();
const tempUpload = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por arquivo
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota de upload
app.post("/upload", tempUpload.array("files", 350), (req, res) => {
  const { data, responsavel, chassi, tipo } = req.body;

  if (!data || !responsavel || !chassi || !tipo) {
    return res.status(400).send("❌ Campos obrigatórios não preenchidos.");
  }

  const [ano, mes, dia] = data.split("-");
  const mesIndex = parseInt(mes, 10) - 1;
  const mesExtenso = `${meses[mesIndex]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  // Caminho até o chassi
  const basePath = path.join(baseUploadPath, mesExtenso, diaMes, chassi);

  // Caminho da inspeção (tipo)
  const tipoFolder = path.join(basePath, tipo);

  // Verificação de duplicidade
  if (fs.existsSync(tipoFolder)) {
    const subPastas = fs
      .readdirSync(tipoFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const pasta of subPastas) {
      const arquivos = fs.readdirSync(path.join(tipoFolder, pasta.name));
      if (arquivos.length > 0) {
        return res
          .status(409)
          .send("❌ Já existe inspeção para esse chassi e tipo.");
      }
    }
  }

  // Criar pasta final: .../chassi/tipo/responsavel
  const finalFolder = path.join(tipoFolder, responsavel);
  fs.mkdirSync(finalFolder, { recursive: true });

  // Salvar arquivos
  req.files.forEach((file) => {
    const timestamp = Date.now();
    const newName = `${timestamp}_${file.originalname}`;
    fs.writeFileSync(path.join(finalFolder, newName), file.buffer);
  });

  res.send("✅ Upload concluído com sucesso!");
});

// Verificação de duplicidade para JS (AJAX)
app.post("/verificar-chassi", (req, res) => {
  const { data, chassi, tipo } = req.body;

  if (!data || !chassi || !tipo) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const [ano, mes, dia] = data.split("-");
  const mesIndex = parseInt(mes, 10) - 1;
  const mesExtenso = `${meses[mesIndex]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  const tipoPath = path.join(baseUploadPath, mesExtenso, diaMes, chassi, tipo);

  const exists = fs.existsSync(tipoPath);
  res.json({ exists });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
