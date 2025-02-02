const fs = require("fs");
const path = require("path");

const pastaImagens = path.join(__dirname, "public/images");
const destinoJson = path.join(__dirname, "public/imagens.json");

fs.readdir(pastaImagens, (err, files) => {
  if (err) {
    console.error("Erro ao ler a pasta de imagens:", err);
    return;
  }

  const imagens = files.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));

  fs.writeFile(destinoJson, JSON.stringify(imagens, null, 2), err => {
    if (err) {
      console.error("Erro ao salvar o JSON:", err);
    } else {
      console.log("Lista de imagens gerada com sucesso!");
    }
  });
});
