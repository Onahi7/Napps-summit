import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { config } from '@/config/production';
import { logger } from '@/utils/logger';

// Create Redis client
const redis = new Redis({
  url: config.redisUrl!,
});

// Create rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    config.rateLimitRequests,
    config.rateLimitWindow
  ),
});

export async function apiMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${ip}`
  );

  // Set rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  // Log API request
  logger.info('API Request', {
    method: request.method,
    path: request.nextUrl.pathname,
    ip,
    userAgent: request.headers.get('user-agent'),
  });

  // Check rate limit
  if (!success) {
    logger.warn('Rate limit exceeded', { ip });
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: response.headers,
    });
  }

  try {
    // Add request timing
    const start = Date.now();
    const res = await response;
    const duration = Date.now() - start;

    // Log API response
    logger.info('API Response', {
      method: request.method,
      path: request.nextUrl.pathname,
      status: res.status,
      duration,
    });

    return res;
  } catch (error) {
    logger.error('API Error', {
      method: request.method,
      path: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: response.headers,
    });
  }
}

// API routes configuration
export const config = {
  matcher: '/api/:path*',
};
