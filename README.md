# Fotos Chassis

Sistema web de upload de fotos para controle de imagens organizadas por data, nome do responsável, tipo de inspeção e número do chassi. Baseado em cenários onde várias imagens são associadas a inspeção das máquinas.

---

## Funcionalidades

- Upload em massa de imagens (80 a 150 fotos por vez)
- Organização automática em pastas com a seguinte estrutura:

  mês/
  dia/
  chassi/
  tipo de inspeção/
  responsável/
  [fotos...]

- Interface simples via navegador (frontend em HTML/CSS/JS)
- Backend em Node.js
- Armazenamento local (diretório no servidor)
- Tailscale (para acesso remoto ao servidor local)
