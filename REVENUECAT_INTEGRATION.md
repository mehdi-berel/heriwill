# RevenueCat Integration Guide

This document explains how RevenueCat is integrated into the Heriwill SaaS application for subscription management.

## Overview

RevenueCat is integrated to handle:
- Subscription purchases (Legacy and Pro plans)
- Entitlement management
- Customer subscription status
- Payment processing via web SDK

## Setup

### 1. Environment Variables

Add your RevenueCat configuration to `.env.local`:

```env
# RevenueCat Configuration
# App ID: app8388d0e3e6
NEXT_PUBLIC_REVENUECAT_API_KEY=your_web_api_key_here
NEXT_PUBLIC_REVENUECAT_APP_ID=app8388d0e3e6
```

**Current Configuration:**
- **App ID:** `app8388d0e3e6`
- **API Key:** Web SDK API key (configured in `.env.local`)
- **Environment:** Production/Test (depending on your RevenueCat dashboard settings)

### 2. Package Installation

RevenueCat is already installed via npm:

```json
"@revenuecat/purchases-js": "^1.24.3"
```

## Architecture

### Core Files

1. **`lib/revenuecat.ts`** - RevenueCat SDK wrapper with utility functions
2. **`contexts/RevenueCatContext.tsx`** - React context provider for global state
3. **`components/module/settings/billing-settings.tsx`** - Billing UI component
4. **`app/layout.tsx`** - Root layout with RevenueCatProvider

### Key Functions

#### `lib/revenuecat.ts`

- `initializeRevenueCat(userId)` - Initialize SDK with user ID
- `getOfferings()` - Fetch available subscription packages
- `purchasePackage(package)` - Process subscription purchase
- `getCustomerInfo()` - Get customer subscription details
- `getSubscriptionTier()` - Returns 'free', 'premium', or 'pro'
- `checkProEntitlement()` - Check if user has pro access
- `getActiveEntitlements()` - Get all active entitlements
- `canAccessFeature(feature)` - Check feature access by tier
- `checkLimits(type, count)` - Validate vault/heir limits

#### `contexts/RevenueCatContext.tsx`

Provides global state:
- `isProUser` - Boolean for pro status
- `entitlements` - Array of active entitlement IDs
- `loading` - Loading state
- `refreshEntitlements()` - Refresh subscription data

## Usage

### In Components

```tsx
import { useRevenueCat } from '@/contexts/RevenueCatContext'

function MyComponent() {
  const { isProUser, entitlements, loading, refreshEntitlements } = useRevenueCat()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {isProUser ? 'Pro User' : 'Free User'}
    </div>
  )
}
```

### Checking Features

```tsx
import { canAccessFeature } from '@/lib/revenuecat'

const hasAccess = await canAccessFeature('assets')
if (!hasAccess) {
  // Show upgrade prompt
}
```

### Checking Limits

```tsx
import { checkLimits } from '@/lib/revenuecat'

const { allowed, limit } = await checkLimits('vaults', currentVaultCount)
if (!allowed) {
  // Show limit reached message
}
```

## Subscription Tiers

### Free (Classic Plan)
- 1 vault
- 1 heir
- 1GB storage
- Basic security
- Email support

### Premium (Legacy Plan)
- Unlimited vaults
- Unlimited heirs
- 10GB storage
- Advanced security
- Priority support
- €10/month

### Pro Plan
- Everything in Legacy
- 100GB storage
- Asset management
- Legal document storage
- Notary services
- €20/month

## Billing Settings Component

The billing settings page (`/settings` → Billing tab) displays:

1. **Current Plan Card** - Shows active subscription with features
2. **Available Plans** - Displays RevenueCat offerings (only for free users)
3. **Manage Subscription** - Opens RevenueCat management URL
4. **Purchase Flow** - Handles subscription purchases with loading states

### Purchase Flow

1. User clicks "Subscribe Now" on a plan
2. `handlePurchase()` is called with the package
3. RevenueCat SDK processes the payment
4. Entitlements are refreshed
5. UI updates to show new subscription status

## RevenueCat Dashboard Setup

### App Configuration

**App ID:** `app8388d0e3e6`

Access your app dashboard at: `https://app.revenuecat.com/apps/app8388d0e3e6`

### Required Configuration

1. **Products**: Create products in RevenueCat dashboard
   - Legacy Plan (premium entitlement)
   - Pro Plan (pro entitlement)

2. **Entitlements**: 
   - `premium` - For Legacy plan features
   - `pro` - For Pro plan features

3. **Offerings**: Create a "current" offering with both packages

4. **API Keys**: Generate web SDK API key (already configured)

## Testing

### Test Mode

The current API key is in test mode. To test purchases:

1. Navigate to Settings → Billing
2. Click "Subscribe Now" on any plan
3. Use RevenueCat's test payment flow
4. Verify entitlements update correctly

### Debugging

Check browser console for RevenueCat logs:
- Initialization status
- Offering fetch results
- Purchase attempts
- Entitlement updates

## Error Handling

The integration includes error handling for:
- Missing API key
- Failed initialization
- Purchase cancellation
- Network errors
- Invalid offerings

Errors are logged to console and shown to users via alerts.

## Next Steps

1. **Production Setup**: Replace test API key with production key
2. **Payment Provider**: Configure Stripe/PayPal in RevenueCat
3. **Webhooks**: Set up RevenueCat webhooks for subscription events
4. **Analytics**: Track subscription metrics
5. **UI Enhancement**: Replace alerts with toast notifications

## Support

For RevenueCat-specific issues:
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Web SDK Guide](https://docs.revenuecat.com/docs/web)
- [Dashboard](https://app.revenuecat.com/)
