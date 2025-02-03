import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

export async function generateQRCode(owner, repoName) {
    try {
        const url = `https://${owner}.github.io/${repoName}/`;
        console.log(`> Gerando QR Code para: ${url}`);

        // Gera o QR Code e salva como imagem
        await QRCode.toFile(path.join(__dirname, '../template/public/qrcode.png'), url, {
            width: 300,
            margin: 2
        });

        console.log(`> QR Code salvo em: ${outputFile}`);
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
    }
}

// Obtém a URL passada como argumento pelo orquestrador
const url = process.argv[2];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, '../template/public/qrcode.png');

if (!url) {
    console.error("Erro: Informe a URL como argumento.");
    process.exit(1);
}

// Executa a função
generateQRCode(url);
