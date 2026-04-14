export const SERVER_CONFIG = {
  port: Number(process.env.PORT) || 3201,
  defaultChannelName: process.env.DEFAULT_CHANNEL || 'default-channel',
} as const;
