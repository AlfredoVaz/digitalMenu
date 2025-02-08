import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

export async function generateQRCode(siteUrl) {
  try {
    console.log(`> Gerando QR Code para: ${siteUrl}`);
    const url = siteUrl;
    // Gera o QR Code e salva como imagem
    await QRCode.toFile(
      path.join(__dirname, '../template/public/qrcode.png'),
      siteUrl,
      {
        width: 300,
        margin: 2,
      },
    );

    console.log(`> QR Code salvo em: ${outputFile}`);
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
  }
}

// Obtém a URL passada como argumento pelo orquestrador
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, '../template/public/qrcode.png');
