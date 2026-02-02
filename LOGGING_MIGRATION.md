# Logging & Toast Migration Guide

## Overview
This document tracks the migration from `console.*` statements to proper logging (`logger`) and user-facing notifications (`toast`).

## New System Components

### 1. Logger Utility (`lib/utils/logger.ts`)
- ✅ Already exists
- Use for backend/server-side logging
- Methods: `logger.info()`, `logger.error()`, `logger.warn()`, `logger.debug()`

### 2. Toast Utility (`lib/utils/toast.ts`)
- ✅ Created
- Use for user-facing notifications
- Methods: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`

### 3. Toast Hook (`hooks/useToast.tsx`)
- ✅ Created
- React hook for managing toast state

### 4. Toast Provider (`components/providers/ToastProvider.tsx`)
- ✅ Created
- Must be added to root layout

## Migration Rules

### Rule 1: Backend/Server Files (Actions, Services, API Routes)
```typescript
// OLD
console.error('Error message:', error)
console.warn('Warning message')
console.log('Info message')

// NEW
import { logger } from '@/lib/utils/logger'

logger.error('Error message', error, { context: 'optional' })
logger.warn('Warning message', { context: 'optional' })
logger.info('Info message', { context: 'optional' })
```

### Rule 2: Frontend Components (Pages, Components)
```typescript
// OLD - Error logging
console.error('Error loading data:', error)

// NEW - Error logging (backend will log, show user-friendly message)
import { toast } from '@/lib/utils/toast'
import { logger } from '@/lib/utils/logger'

logger.error('Error loading data', error)
toast.error('Failed to load data', 'Please try again later')

// OLD - Warning to user
console.warn('Feature not implemented')

// NEW - Show toast to user
toast.warning('Feature not available', 'This feature is coming soon')

// OLD - Success message
console.log('Data saved successfully')

// NEW - Show success toast
toast.success('Data saved successfully')
```

## Migration Status

### ✅ Completed
- [x] Created toast utility system
- [x] Created useToast hook
- [x] Created ToastProvider component
- [x] Updated `app/actions/heirInvitations.ts` (5 replacements)

### 🔄 In Progress
- [ ] `lib/services/globalTriggerService.ts` (13 console statements)
- [ ] `lib/services/inheritancePlanService.ts` (already uses logger ✓)

### 📋 Pending - High Priority Files

#### Actions Files (app/actions/)
- [ ] `users.ts`
- [ ] `vaults.ts`
- [ ] `heirs.ts`
- [ ] `assets.ts`
- [ ] `physical-assets.ts`

#### Dashboard Pages (app/(dashboard)/)
- [ ] `assets/[id]/page.tsx` (13 statements)
- [ ] `assets/page.tsx` (12 statements)
- [ ] `vaults/page.tsx` (12 statements)
- [ ] `vaults/[id]/page.tsx` (10 statements)
- [ ] `heirs/page.tsx` (10 statements)
- [ ] `heirs/[id]/page.tsx` (8 statements)
- [ ] `will/page.tsx` (6 statements)
- [ ] `sign-off/page.tsx`
- [ ] `notary/page.tsx`
- [ ] `Legal/page.tsx`

#### Components (components/module/)
- [ ] `inheritance/inheritance-page.tsx` (6 statements)
- [ ] `sign-off/sign-off-settings-modal.tsx` (6 statements)
- [ ] `vaults/vault-assign.tsx`
- [ ] `settings/*` components

#### Services & Utils (lib/)
- [ ] `utils/fileUpload.ts` (6 statements)
- [ ] `middleware/tierEnforcement.ts` (5 statements)

## Installation Steps

### Step 1: Add ToastProvider to Root Layout
```typescript
// app/layout.tsx
import { ToastProvider } from '@/components/providers/ToastProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

### Step 2: Batch Replace Console Statements

Use this regex pattern to find console statements:
```
console\.(log|error|warn|info|debug)
```

### Step 3: Import Statements

Add to backend files:
```typescript
import { logger } from '@/lib/utils/logger'
```

Add to frontend files:
```typescript
import { toast } from '@/lib/utils/toast'
import { logger } from '@/lib/utils/logger' // if also logging errors
```

## Testing Checklist

- [ ] Verify ToastProvider is in root layout
- [ ] Test toast notifications appear on screen
- [ ] Test toast auto-dismissal (5 seconds default)
- [ ] Test toast manual dismissal (X button)
- [ ] Verify logger outputs in development console
- [ ] Verify no console.* statements remain (except in node_modules)

## Statistics

- **Total console statements found:** 1,133
- **Files affected:** 158 (excluding node_modules)
- **Statements replaced:** 5
- **Remaining:** 1,128

## Notes

- `node_modules` files are excluded from migration
- Logger already exists and is used in `inheritancePlanService.ts`
- Some files may have both logger and toast (error logging + user notification)
- Console statements in development/debug code can remain if clearly marked
