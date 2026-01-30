# Deployment Guide for HeriWill SaaS

## Production Domain
**URL:** https://app.heriwill.com

## Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.local` file (or configure in your hosting platform) with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://app.heriwill.com
```

### 2. Supabase Configuration

#### A. Authentication Settings
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add redirect URLs:
   - `https://app.heriwill.com/login`
   - `https://app.heriwill.com/dashboard`
   - `https://app.heriwill.com/invite`
3. Set Site URL: `https://app.heriwill.com`

#### B. CORS Configuration
1. Go to Supabase Dashboard → Settings → API
2. Add allowed origins:
   - `https://app.heriwill.com`
   - `https://www.heriwill.com` (if applicable)

#### C. Email Templates
1. Configure email templates in Supabase Dashboard → Authentication → Email Templates
2. Update all email links to use `https://app.heriwill.com`

#### D. Row Level Security (RLS)
✅ Already enabled on all tables via migrations
- Verify policies are active in Supabase Dashboard → Database → Policies

### 3. Database Migrations
Run all migrations in order:
1. `enable_rls_policies.sql`
2. `create_notaries_and_wills_tables.sql`
3. `add_user_type_to_users.sql`
4. Any other custom migrations

### 4. Hosting Platform Setup

#### Recommended: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard
```

#### Environment Variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

### 5. DNS Configuration
Point your domain to the hosting platform:
- **A Record:** Point to hosting IP (if applicable)
- **CNAME Record:** Point to hosting domain (e.g., `cname.vercel-dns.com`)

### 6. SSL/TLS Certificate
- ✅ Automatic with Vercel/Netlify
- Verify HTTPS is enforced
- Check certificate validity

### 7. Security Headers Verification
After deployment, verify headers at: https://securityheaders.com

Expected headers:
- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Content-Security-Policy

### 8. Performance Optimization
- Enable caching in hosting platform
- Configure CDN (automatic with Vercel)
- Optimize images (Next.js Image component)
- Enable compression

### 9. Monitoring & Analytics
Set up monitoring:
- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics or Google Analytics
- **Uptime Monitoring:** UptimeRobot or Pingdom
- **Performance:** Lighthouse CI

### 10. Backup Strategy
- ✅ Supabase automatic backups (check retention policy)
- Set up daily backup exports (optional)
- Document recovery procedures

## Post-Deployment Verification

### Functional Tests
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Dashboard loads correctly
- [ ] Vault creation/editing works
- [ ] Heir invitation works
- [ ] Notary invitation works
- [ ] All protected routes require auth
- [ ] RLS policies prevent unauthorized access

### Security Tests
- [ ] HTTPS enforced (no HTTP access)
- [ ] Security headers present
- [ ] Session management works correctly
- [ ] CSRF protection active
- [ ] XSS protection active
- [ ] SQL injection protection verified
- [ ] Rate limiting works (Supabase)

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness verified
- [ ] Images optimized
- [ ] API response time < 500ms

## Deployment Commands

### Build Locally
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

## Rollback Procedure
If issues occur after deployment:

1. **Immediate Rollback (Vercel):**
   ```bash
   vercel rollback
   ```

2. **Database Rollback:**
   - Restore from Supabase backup
   - Revert migrations if needed

3. **Notify Users:**
   - Post status update
   - Send email if critical

## Maintenance Mode
To enable maintenance mode:

1. Create `app/maintenance/page.tsx`
2. Update middleware to redirect all routes
3. Deploy maintenance page

## Support & Troubleshooting

### Common Issues

**Issue:** "Invalid redirect URL"
- **Fix:** Add URL to Supabase Auth redirect URLs

**Issue:** CORS errors
- **Fix:** Add domain to Supabase CORS settings

**Issue:** Environment variables not working
- **Fix:** Restart deployment after setting env vars

**Issue:** RLS blocking queries
- **Fix:** Verify user is authenticated and policies are correct

### Logs & Debugging
- **Vercel Logs:** `vercel logs`
- **Supabase Logs:** Dashboard → Logs
- **Browser Console:** Check for client-side errors

## Production Monitoring Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review failed login attempts

### Weekly
- [ ] Review performance metrics
- [ ] Check database size/usage
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Security audit
- [ ] Backup verification
- [ ] Cost review
- [ ] Performance optimization

## Contact & Support
- **Technical Issues:** Check SECURITY.md
- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support

---

**Last Updated:** 2026-01-30  
**Production URL:** https://app.heriwill.com  
**Status:** Ready for Deployment ✅
