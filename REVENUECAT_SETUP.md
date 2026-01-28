# RevenueCat Integration Setup Guide

This guide will help you set up RevenueCat for subscription management in your Heriwill SaaS application.

## Overview

RevenueCat has been integrated into this Next.js application to handle:
- Subscription management (Free, Premium, Pro tiers)
- Entitlement checking
- Purchase processing via Stripe (through RevenueCat Web Billing)
- Cross-platform subscription sync

## Prerequisites

1. **RevenueCat Account**: Sign up at [https://app.revenuecat.com/signup](https://app.revenuecat.com/signup)
2. **Stripe Account**: Required for RevenueCat Web Billing

## Setup Steps

### 1. Create RevenueCat Project

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Create a new project
3. Navigate to your project settings

### 2. Configure Products & Entitlements

#### Create Entitlements:
1. Go to **Entitlements** in the RevenueCat dashboard
2. Create an entitlement named `pro`
3. This will be used to check if users have Pro access

#### Create Products:
1. Go to **Products** section
2. Create products for your subscription tiers:
   - **Free**: No product needed (default)
   - **Premium**: Create a product (e.g., `premium_monthly`)
   - **Pro**: Create a product (e.g., `pro_monthly`)

#### Create Offerings:
1. Go to **Offerings** section
2. Create a default offering
3. Add packages:
   - Monthly Pro: Link to `pro_monthly` product
   - Annual Pro: Link to `pro_annual` product (if applicable)

### 3. Connect Stripe to RevenueCat

1. In RevenueCat dashboard, go to **Integrations** → **Stripe**
2. Connect your Stripe account
3. RevenueCat will sync your products with Stripe

### 4. Get API Keys

1. In RevenueCat dashboard, go to **API Keys**
2. Copy your **Public API Key** (starts with `rc_`)
3. Add it to your `.env.local` file:

```bash
NEXT_PUBLIC_REVENUECAT_API_KEY=rc_your_public_api_key_here
```

### 5. Wrap Your App with RevenueCat Provider

Update your root layout to include the RevenueCat provider:

```tsx
// app/layout.tsx
import { RevenueCatProvider } from '@/contexts/RevenueCatContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RevenueCatProvider>
          {children}
        </RevenueCatProvider>
      </body>
    </html>
  )
}
```

## Usage

### Check Pro Entitlement

Use the `useRevenueCat` hook to check subscription status:

```tsx
import { useRevenueCat } from '@/contexts/RevenueCatContext'

function MyComponent() {
  const { isProUser, loading } = useRevenueCat()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {isProUser ? (
        <ProFeature />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  )
}
```

### Display Subscription Offerings

```tsx
import { getOfferings, purchasePackage } from '@/lib/revenuecat'

async function handlePurchase() {
  try {
    const offerings = await getOfferings()
    const currentOffering = offerings?.current
    
    if (currentOffering) {
      const monthlyPackage = currentOffering.monthly
      await purchasePackage(monthlyPackage)
      // Purchase successful!
    }
  } catch (error) {
    console.error('Purchase failed:', error)
  }
}
```

## Files Created

- **`lib/revenuecat.ts`**: Core RevenueCat utilities
  - `initializeRevenueCat()`: Initialize SDK with user ID
  - `checkProEntitlement()`: Check if user has Pro access
  - `getOfferings()`: Get available subscription plans
  - `purchasePackage()`: Process a purchase

- **`contexts/RevenueCatContext.tsx`**: React context provider
  - Manages global subscription state
  - Auto-initializes on user login
  - Provides `useRevenueCat()` hook

- **`.env.example`**: Environment variable template

## Testing

### Test Mode
RevenueCat provides a sandbox environment for testing:

1. Use test mode in RevenueCat dashboard
2. Use Stripe test cards for purchases
3. Test card: `4242 4242 4242 4242`

### Verify Integration

```tsx
// Test entitlement check
import { checkProEntitlement } from '@/lib/revenuecat'

const isPro = await checkProEntitlement()
console.log('User has Pro:', isPro)
```

## Migration from Supabase Subscription Tier

The current implementation checks `subscription_tier` in Supabase. To migrate:

1. Keep Supabase as source of truth initially
2. Sync RevenueCat entitlements to Supabase via webhooks
3. Gradually transition to RevenueCat as primary source

### Webhook Setup (Optional)

Configure RevenueCat webhooks to update Supabase:

1. Create webhook endpoint: `/api/webhooks/revenuecat`
2. Update `users.subscription_tier` based on entitlements
3. Configure webhook URL in RevenueCat dashboard

## Troubleshooting

### "RevenueCat not initialized" Error
- Ensure API key is set in `.env.local`
- Check that `RevenueCatProvider` wraps your app
- Verify user is logged in before checking entitlements

### Purchases Not Working
- Verify Stripe integration is active
- Check that products are properly configured
- Ensure you're using the correct offering IDs

### Entitlements Not Updating
- Call `refreshEntitlements()` after purchase
- Check RevenueCat dashboard for customer info
- Verify entitlement configuration

## Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [Web SDK Reference](https://www.revenuecat.com/docs/getting-started/installation/web-sdk)
- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)

## Support

For issues with:
- **RevenueCat**: [RevenueCat Support](https://community.revenuecat.com/)
- **Stripe**: [Stripe Support](https://support.stripe.com/)
- **Integration**: Check console logs and RevenueCat dashboard
