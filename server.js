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

//  Caminho de destino oficial (servidor)
const baseUploadPath = path.join(
  "Y:",
  "Fotos Pré embarque - 2025",
  "Embarques"
);

/*  Caminho antigo para testes locais
const baseUploadPath = path.join(
  "C:",
  "Users",
  "Cleyton Lima",
  "Downloads",
  "Uploads"
);
*/

const tempStorage = multer.memoryStorage();
const tempUpload = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por arquivo
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🚚 Rota de upload
app.post("/upload", tempUpload.array("files", 350), (req, res) => {
  const { data, responsavel, chassi, tipo } = req.body;

  if (!data || !responsavel || !chassi || !tipo) {
    return res.status(400).send("❌ Campos obrigatórios não preenchidos.");
  }

  const [ano, mes, dia] = data.split("-");
  const mesIndex = parseInt(mes, 10) - 1;
  const mesExtenso = `${meses[mesIndex]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  const basePath = path.join(baseUploadPath, mesExtenso, diaMes, chassi, tipo);

  // 🔍 Verificação de duplicidade
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

  // 🗂️ Criar pasta final com o nome do responsável
  const finalFolder = path.join(basePath, responsavel);
  fs.mkdirSync(finalFolder, { recursive: true });

  req.files.forEach((file) => {
    const timestamp = Date.now();
    const newName = `${timestamp}_${file.originalname}`;
    fs.writeFileSync(path.join(finalFolder, newName), file.buffer);
  });

  res.send("✅ Upload concluído com sucesso!");
});

// 🔎 Verificação prévia via AJAX (frontend)
app.post("/verificar-chassi", (req, res) => {
  const { data, chassi, tipo } = req.body;

  if (!data || !chassi || !tipo) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const [ano, mes, dia] = data.split("-");
  const mesIndex = parseInt(mes, 10) - 1;
  const mesExtenso = `${meses[mesIndex]} - ${ano}`;
  const diaMes = `${dia}-${mes}`;

  const chassiPath = path.join(
    baseUploadPath,
    mesExtenso,
    diaMes,
    chassi,
    tipo
  );

  let exists = false;

  if (fs.existsSync(chassiPath)) {
    const subPastas = fs
      .readdirSync(chassiPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const pasta of subPastas) {
      const arquivos = fs.readdirSync(path.join(chassiPath, pasta.name));
      if (arquivos.length > 0) {
        exists = true;
        break;
      }
    }
  }

  return res.json({ exists });
});

// ▶️ Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
