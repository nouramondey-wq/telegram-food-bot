/**
 * 🚀 Production API + Webhook Server for Telegram Bot
 *
 * Runs alongside the Telegram bot on Railway (single service).
 * - Serves Telegram webhook endpoint (POST /webhook)
 * - Handles Mini App API endpoints (POST /api/validate, /api/order/reorder)
 * - Health check for Railway monitoring (GET /health)
 *
 * Architecture: Single Express server handles everything on one PORT.
 */
import express from 'express';
import { Telegraf } from 'telegraf';
export declare function createApp(bot?: Telegraf): express.Application;
export declare function startApiServer(bot?: Telegraf): void;
//# sourceMappingURL=server.d.ts.map