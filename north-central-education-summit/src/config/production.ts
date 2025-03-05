export const config = {
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  payment: {
    paystack: {
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    },
    flutterwave: {
      publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    },
  },
};
