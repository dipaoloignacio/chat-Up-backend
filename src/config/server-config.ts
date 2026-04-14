export const SERVER_CONFIG = {

  port: Number(process.env.PORT) || 3205,
  defaultChannelName: process.env.DEFAULT_CHANNEL || 'default-channel',
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  base_url: process.env.BASE_URL,
  ws_url: process.env.WS_URL,
  bot_email: process.env.BOT_EMAIL,
  bot_password: process.env.BOT_PASSWORD,
  message_limit: Number(process.env.MESSAGE_LIMIT),
  cors_origin: process.env.CORS_ORIGIN

} as const;
