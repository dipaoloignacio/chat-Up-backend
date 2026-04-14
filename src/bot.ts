import Anthropic from '@anthropic-ai/sdk';
import { SERVER_CONFIG } from './config/server-config';

const BASE_URL = SERVER_CONFIG.base_url;
const WS_URL = SERVER_CONFIG.ws_url;

const BOT_EMAIL = SERVER_CONFIG.bot_email;
const BOT_PASSWORD = SERVER_CONFIG.bot_password;
const MESSAGE_LIMIT = SERVER_CONFIG.message_limit;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const histories: Record<string, { role: 'user' | 'assistant'; content: string }[]> = {};
const userMessageCount: Record<string, { count: number; date: string }> = {};

function isOverLimit(userId: string): boolean {
    const today = new Date().toISOString().split('T')[0] ?? '';

    if (!userMessageCount[userId] || userMessageCount[userId].date !== today) {
        userMessageCount[userId] = { count: 0, date: today };
    }

    if (userMessageCount[userId].count >= MESSAGE_LIMIT) return true;

    userMessageCount[userId].count++;
    return false;
}

async function login(): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: BOT_EMAIL, password: BOT_PASSWORD }),
    });

    if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);

    const data = await res.json() as { token: string };
    return data.token;
}

async function connectBot() {
    const token = await login();
    
    if (!process.env.WS_URL) {
        throw new Error("WS_URL no está definida en el .env");
    }

    const ws = new WebSocket(WS_URL!, {
        headers: { Cookie: `X-Token=${token}` },
    } as any);

    ws.addEventListener('open', () => {
        console.log('🤖 Bot conectado');
    });

    ws.addEventListener('message', async (event) => {
        const msg = JSON.parse(event.data as string);

        if (msg.type !== 'SEND_DIRECT_MESSAGES_RESPONSE') return;

        const { messages } = msg.payload;
        if (!messages?.length) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender?.name === 'Claude 🤖') return;

        const senderId = lastMessage.sender?.id;
        if (!senderId) return;

        const userText = lastMessage.content;
        console.log(`💬 ${lastMessage.sender?.name}: ${userText}`);

        // Verificar límite antes de llamar a Claude
        if (isOverLimit(senderId)) {
            console.log(`⚠️ Usuario ${lastMessage.sender?.name} alcanzó el límite`);
            ws.send(JSON.stringify({
                type: 'SEND_DIRECT_MESSAGE',
                payload: {
                    content: `Alcanzaste el límite de ${MESSAGE_LIMIT} mensajes por día. Volvé mañana 😊`,
                    receiverId: senderId,
                },
            }));
            return;
        }

        if (!histories[senderId]) histories[senderId] = [];
        histories[senderId].push({ role: 'user', content: userText });

        let botReply = 'Lo siento, no puedo responder ahora mismo.';

        try {
            const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: `Sos un asistente amigable dentro de una app de chat llamada Chat-Up.
                 Respondé de forma corta, natural y conversacional en español.
                 Nunca uses markdown ni asteriscos, solo texto plano.`,
                messages: histories[senderId],
            });

            const block = response.content[0];
            botReply = block?.type === 'text' ? block.text : botReply;

        } catch (error) {
            console.error('Error llamando a Claude:', error);
        }

        histories[senderId].push({ role: 'assistant', content: botReply });
        console.log(`🤖 Respondiendo: ${botReply}`);

        ws.send(JSON.stringify({
            type: 'SEND_DIRECT_MESSAGE',
            payload: {
                content: botReply,
                receiverId: senderId,
            },
        }));
    });

    ws.addEventListener('close', () => {
        console.log('Bot desconectado, reconectando en 3s...');
        setTimeout(connectBot, 3000);
    });

    ws.addEventListener('error', (err) => {
        console.error('Bot error:', err);
    });
}

connectBot();