export const config = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Email (SendGrid)
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  
  // Payment (Paystack)
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  
  // Storage
  storageUrl: process.env.NEXT_PUBLIC_STORAGE_URL,
  
  // Application
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Analytics
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  
  // Logging
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Cache
  redisUrl: process.env.REDIS_URL,
  
  // Rate Limiting
  rateLimitRequests: 100,
  rateLimitWindow: '15m',
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
