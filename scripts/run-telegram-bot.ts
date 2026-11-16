#!/usr/bin/env tsx
/**
 * Standalone Runner for DharmaWatch Newsroom Telegram Bot
 */

import { startTelegramBot } from '../server/telegramBot.js';

console.log('--------------------------------------------------');
console.log('Launching DharmaWatch Newsroom Telegram Control Bot');
console.log('Bot Username: @Dwadmincontrolbot');
console.log('--------------------------------------------------');

startTelegramBot().catch((err) => {
  console.error('Fatal Telegram Bot Error:', err);
});
