import whatsappWeb from 'whatsapp-web.js';
const { Client, NoAuth } = whatsappWeb;
import qrcode from 'qrcode-terminal';
import { createAndPublish } from 'scripts/create-and-publish.js';

const conversationState = {};

const client = new Client({
    authStrategy: new NoAuth()
});

client.on('qr', (qr) => {
    console.log('QR code recebido, por favor, escaneie com seu celular:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('O bot está pronto!');
});

client.on('message_create', async (message) => {
    const chatId = message.from; // Identifica o usuário ou grupo
    const text = message.body.trim().toLowerCase();

    // Se não existir estado salvo para esse chat, inicializa com o estágio "inicial"
    if (!conversationState[chatId]) {
        conversationState[chatId] = { stage: 'inicial' };
    }

    switch (conversationState[chatId].stage) {
        case 'inicial':
            if (text === 'oi' || text === 'olá') {
                await message.reply('Olá! Qual o nome do restaurante?');
                conversationState[chatId].stage = 'aguardando_nome';
            } else {
                await message.reply('Por favor, inicie a conversa cumprimentando (ex.: "Oi" ou "Olá").');
            }
            break;

        case 'aguardando_nome':
            const restaurantName = message.body.trim();
            const respoName = restaurantName.toLowerCase().join('-');

            await message.reply(`Ótimo! Você escolheu o restaurante "${restaurantName}". Iniciando o script...`);
            conversationState[chatId].stage = 'script_iniciado';
            await createAndPublish(respoName);
            break;

        case 'script_iniciado':
            await message.reply('O script já foi iniciado. Se quiser reiniciar a conversa, envie "reiniciar".');
            if (text === 'reiniciar') {
                conversationState[chatId].stage = 'inicial';
                await message.reply('Conversa reiniciada. Por favor, cumprimente para iniciar novamente.');
            }
            break;

        default:
            await message.reply('Desculpe, não entendi. Poderia repetir?');
            break;
    }
});

client.initialize();