import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

// Simple in-memory rate limiter for the validation endpoint
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // requests
const RATE_LIMIT_WINDOW = 60_000; // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * API Route: Validate Telegram initData
 * 
 * Production endpoint for verifying Telegram.WebApp.initData on the server.
 * Protects against spoofed requests from outside Telegram.
 * 
 * Called by the Mini App client before signing in to Firebase.
 */

function validateTelegramInitData(
  initData: string,
  botToken: string
): { data: Record<string, string>; isValid: boolean } {
  const parsed = new URLSearchParams(initData);
  const hash = parsed.get('hash');

  if (!hash) {
    return { data: Object.fromEntries(parsed), isValid: false };
  }

  parsed.delete('hash');

  const dataCheckString = Array.from(parsed.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const isValid = computedHash === hash;

  const result: Record<string, string> = {};
  for (const [key, value] of parsed.entries()) {
    result[key] = value;
  }

  return { data: result, isValid };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { initData } = await request.json();

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json(
        { error: 'Missing initData' },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured on server');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { data, isValid } = validateTelegramInitData(initData, botToken);

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'Invalid initData signature' },
        { status: 401 }
      );
    }

    // Check freshness (max 5 minutes old — prevents replay attacks)
    const authDate = parseInt(data.auth_date || '0', 10) * 1000;
    const isFresh = Date.now() - authDate < 5 * 60 * 1000;

    if (!isFresh) {
      return NextResponse.json(
        { valid: false, error: 'initData expired' },
        { status: 401 }
      );
    }

    // Parse user
    let user = null;
    if (data.user) {
      try {
        user = JSON.parse(data.user);
      } catch {
        // ignore parse errors
      }
    }

    return NextResponse.json({
      valid: true,
      user,
      auth_date: parseInt(data.auth_date || '0', 10),
      query_id: data.query_id,
    });
  } catch (error) {
    console.error('initData validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
