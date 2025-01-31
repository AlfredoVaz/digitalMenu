const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("assets")); 
app.use(express.static(".")); 

app.get("/images", (req, res) => {
    const imageDir = path.join(__dirname, "assets/images");
    fs.readdir(imageDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao listar imagens" });
        }
        const images = files.map(file => `/assets/images/${file}`);
        res.json(images);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
