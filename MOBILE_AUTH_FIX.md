# Mobile OAuth Authentication Fix

## Problem
Git/Google OAuth was opening a popup on mobile, briefly loading, then closing without completing authentication. Email and guest auth worked fine.

## Root Cause
1. Mobile detection was not comprehensive enough (missing in-app browsers, some mobile browsers)
2. Popup auth doesn't work reliably on mobile browsers due to:
   - Safari Intelligent Tracking Prevention (ITP)
   - Chrome 3rd-party cookie blocking
   - In-app browser restrictions (Instagram, Facebook, etc.)

## Solution Implemented

### 1. Enhanced Mobile Detection (`/src/lib/deviceUtils.ts`)
- Added detection for Chrome Mobile, Firefox Mobile, Safari Mobile
- Added detection for in-app browsers (Instagram, Facebook, Twitter, etc.)
- Added detailed debug logging to verify detection is working
- More comprehensive user agent checks

### 2. Forced Redirects on Mobile (`/src/context/AuthContext.tsx`)
- **ALWAYS** use `signInWithRedirect` on mobile devices
- Removed popup fallback on mobile entirely
- Added `isRedirecting` state to show loading UI during redirect
- Enhanced error messages for common mobile auth failures
- Better logging for debugging auth flow

### 3. Improved Loading States
- `SignInPrompt.tsx`: Shows "Redirecting to authentication..." message
- `AuthButton.tsx`: Shows "Redirecting..." text when redirect initiated
- Loading spinner displays during redirect process

### 4. Better Error Handling
- User-friendly error messages for common failures:
  - "Authentication was cancelled" (popup-closed-by-user)
  - "Network error. Please check your connection" (network-request-failed)
  - "This domain is not authorized" (unauthorized-domain)
- Detailed console logging for debugging

### 5. Enhanced Firebase Configuration Warnings (`/src/lib/firebase.ts`)
- Logs required authorized domains on startup
- Reminds developers to check Firebase Console settings
- Verifies current domain against auth configuration

## Required Firebase Console Configuration

### ⚠️ CRITICAL: Verify Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **buildathon-judge-2026**
3. Navigate to: **Authentication → Settings → Authorized domains**
4. Ensure the following domains are added:
   - ✅ `buildathon.live`
   - ✅ `www.buildathon.live`
   - ✅ `localhost` (for development)
   - ✅ `buildathon-judge-2026.firebaseapp.com` (Firebase default)

### Why This Matters
Mobile browsers enforce strict security policies. If your production domain (`buildathon.live`) is not in the authorized domains list, OAuth redirects will fail with an `auth/unauthorized-domain` error.

## Testing Checklist

Test on **real devices** (not simulators) for accurate results:

### iOS Testing
- [ ] iOS Safari - Sign in with GitHub
- [ ] iOS Safari - Sign in with Google
- [ ] iOS Chrome - Sign in with GitHub
- [ ] iOS Chrome - Sign in with Google
- [ ] iOS Firefox - Sign in with GitHub
- [ ] iOS Firefox - Sign in with Google

### Android Testing
- [ ] Android Chrome - Sign in with GitHub
- [ ] Android Chrome - Sign in with Google
- [ ] Android Firefox - Sign in with GitHub
- [ ] Android Firefox - Sign in with Google

### In-App Browsers
- [ ] Instagram in-app browser
- [ ] Facebook in-app browser
- [ ] Twitter in-app browser

### Post-Auth Verification
- [ ] User profile is created in Firestore after successful auth
- [ ] User is redirected to correct page after auth
- [ ] User session persists after app reload
- [ ] No infinite redirect loops

## Debugging Mobile Auth Issues

### Check Console Logs
Open Safari/Chrome DevTools on your computer and connect to your mobile device:

**iOS Safari:**
1. Enable Web Inspector: Settings → Safari → Advanced → Web Inspector
2. Connect iPhone to Mac via USB
3. Safari (Mac) → Develop → [Your iPhone] → [buildathon.live]

**Android Chrome:**
1. Enable USB Debugging in Developer Options
2. Connect Android device via USB
3. Chrome (Desktop) → More Tools → Remote Devices

### Key Log Messages
Look for these log messages:
- `[DEVICE] Mobile detection:` - Shows detection results
- `[AUTH] Mobile device detected - using signInWithRedirect` - Confirms redirect is used
- `[AUTH] ✓ Redirect successful!` - Auth completed
- `[AUTH] ✗ Redirect error:` - Auth failed (check error code)

### Common Error Codes
- `auth/unauthorized-domain` → Add domain to Firebase authorized domains
- `auth/popup-closed-by-user` → User cancelled (normal behavior)
- `auth/network-request-failed` → Network issue or CORS problem
- `auth/internal-error` → Check for private/incognito mode or auth domain mismatch

## What Changed

### Files Modified
1. `/src/lib/deviceUtils.ts` - Enhanced mobile detection
2. `/src/context/AuthContext.tsx` - Forced redirects on mobile, added loading states
3. `/src/lib/firebase.ts` - Better auth domain warnings
4. `/src/components/auth/SignInPrompt.tsx` - Redirect loading UI
5. `/src/components/auth/AuthButton.tsx` - Redirect loading UI

### Files Created
- `MOBILE_AUTH_FIX.md` (this file)

## Next Steps

1. **Verify Firebase authorized domains** (see above)
2. **Deploy to production** (buildathon.live)
3. **Test on real mobile devices** (use checklist above)
4. **Monitor Sentry for auth errors** (after Sentry is set up in next task)

## Rollback Plan

If mobile auth still fails after these changes:
1. Temporarily disable mobile OAuth (show email-only on mobile)
2. Add banner: "GitHub/Google sign-in is temporarily unavailable on mobile. Please use email or desktop."
3. Investigate specific error codes in Sentry
4. Consider custom auth domain (e.g., `auth.buildathon.live`) if cross-domain issues persist

## Additional Resources

- [Firebase Auth - OAuth on Mobile](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Handling Redirects](https://firebase.google.com/docs/auth/web/redirect-best-practices#handle-redirects)
- [Authorized Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices#authorized-domains)
