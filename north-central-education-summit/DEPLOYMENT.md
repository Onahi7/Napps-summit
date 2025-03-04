# Deployment Guide

## Prerequisites
- Supabase account and project
- Vercel account
- SendGrid account (for emails)
- Paystack account (for payments)
- Sentry account (for error tracking)

## Environment Variables Setup

### 1. Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Email Service (SendGrid)
```
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email
```

### 3. Payment Gateway (Paystack)
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 4. Application URLs
```
NEXT_PUBLIC_APP_URL=your_production_url
```

### 5. Monitoring and Analytics
```
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 6. Caching and Rate Limiting
```
REDIS_URL=your_redis_url
```

## Deployment Steps

1. **Set up Vercel Project**
   ```bash
   vercel login
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Project Settings
   - Add all environment variables listed above
   - Add additional environment variables if needed

3. **Run Database Migrations**
   ```bash
   # Make sure you have the correct environment variables set
   npm run migrate
   ```

4. **Deploy Application**
   ```bash
   # Deploy to staging first
   npm run deploy:staging

   # Once verified, deploy to production
   npm run deploy
   ```

5. **Verify Deployment**
   - Check application is running at the production URL
   - Verify Supabase connection
   - Test authentication flow
   - Verify email notifications
   - Test payment integration
   - Monitor error tracking in Sentry

## Post-Deployment Checklist

- [ ] Verify all environment variables are correctly set
- [ ] Check database migrations were successful
- [ ] Test user authentication flows
- [ ] Verify admin dashboard access
- [ ] Test validator QR scanning
- [ ] Verify meal validation process
- [ ] Check email notifications
- [ ] Test payment processing
- [ ] Verify analytics tracking
- [ ] Monitor error logs in Sentry
- [ ] Test rate limiting
- [ ] Verify Redis caching
- [ ] Check SSL/TLS configuration
- [ ] Test backup and recovery procedures

## Troubleshooting

1. **Database Migration Issues**
   - Check Supabase credentials
   - Verify migration files syntax
   - Check Supabase console for errors

2. **Deployment Failures**
   - Check build logs in Vercel
   - Verify environment variables
   - Check for TypeScript errors
   - Verify dependencies installation

3. **Runtime Issues**
   - Check Sentry for error logs
   - Verify Redis connection
   - Check email service logs
   - Monitor payment gateway logs

## Rollback Procedure

1. **If deployment fails:**
   ```bash
   vercel rollback
   ```

2. **If database migration fails:**
   - Use Supabase dashboard to restore from backup
   - Run downgrade migration if available

## Maintenance

1. **Regular Tasks**
   - Monitor error logs
   - Check system performance
   - Review security alerts
   - Update dependencies

2. **Backup Schedule**
   - Database: Daily automated backups
   - Configurations: Version controlled
   - User uploads: Regular cloud storage backups
