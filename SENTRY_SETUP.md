# Sentry Error Tracking Setup Guide

## What is Sentry?

Sentry provides real-time error tracking and performance monitoring for your application. It captures errors, shows you the exact line of code that failed, and provides context about what the user was doing when the error occurred.

## Features Implemented

- ✅ Client-side error tracking (browser errors)
- ✅ Server-side error tracking (API routes, server components)
- ✅ Edge runtime error tracking (middleware, edge functions)
- ✅ Session replay on errors (see what user did before error)
- ✅ Error boundary with user-friendly UI
- ✅ Global error handler for root-level errors
- ✅ Source map uploads (see original code, not minified)
- ✅ Error filtering (excludes browser extensions, network errors)

## Sentry Free Tier

- **5,000 errors/month**
- **1 project**
- **1 user**
- **30-day retention**
- **Session replay included**

Perfect for getting started!

## Setup Instructions

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up for free account
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **buildathon-live**
   - Alert frequency: **On every new issue** (recommended for small apps)

### 2. Get Your DSN

After creating the project, Sentry will show you a DSN that looks like:
```
https://abc123@o123456.ingest.sentry.io/789012
```

Copy this DSN - you'll need it for the next step.

### 3. Configure Environment Variables

Add these to your `.env.local` file (DO NOT commit this file):

```bash
# Required: Public DSN for client-side error tracking
NEXT_PUBLIC_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id

# Optional but recommended: For source map uploads
# Get from: Sentry → Settings → Auth Tokens → Create New Token
# Permissions needed: project:releases, project:write, org:read
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=buildathon-live
```

For Vercel deployment, add these as environment variables in your Vercel dashboard.

### 4. Create Auth Token (Optional - for source maps)

Source maps allow you to see the original code in error stack traces instead of minified code.

1. Go to Sentry → Settings → Auth Tokens
2. Click "Create New Token"
3. Name: "buildathon-sourcemaps"
4. Scopes:
   - `project:releases`
   - `project:write`
   - `org:read`
5. Copy the token and add to `.env.local`

### 5. Test Error Tracking

Add a test error button to verify Sentry is working:

```tsx
// Add this to any page during development
<button onClick={() => { throw new Error('Test Sentry Error'); }}>
  Trigger Test Error
</button>
```

Click the button and check your Sentry dashboard - you should see the error appear within seconds!

## What Gets Tracked

### Automatically Tracked Errors

1. **Unhandled JavaScript errors**
   - TypeScript errors
   - Null reference errors
   - Type errors
   - etc.

2. **React component errors**
   - Caught by ErrorBoundary
   - Shows component stack
   - Provides user-friendly fallback UI

3. **API route errors**
   - Server-side errors in `/app/api/*`
   - Database errors
   - Firebase errors

4. **Promise rejections**
   - Unhandled promise rejections
   - Async/await errors

### Error Context Captured

For each error, Sentry captures:
- **User info**: User ID, email (if available)
- **Device info**: Browser, OS, screen resolution
- **Breadcrumbs**: Recent user actions (clicks, navigations)
- **Environment**: Development, staging, or production
- **Release**: Git commit SHA (if available)
- **Session replay**: Video of what user did before error (on error only)

### Filtered Out (Not Tracked)

To reduce noise and stay within free tier limits, we filter out:
- ❌ Browser extension errors (not our code)
- ❌ Network errors (90% filtered - usually user's connection)
- ❌ Health check endpoint errors (not actionable)

## Monitoring Your Errors

### Sentry Dashboard

Navigate to: [sentry.io/organizations/your-org/issues/](https://sentry.io)

You'll see:
- **Issue list**: All errors grouped by type
- **Issue count**: How many times each error occurred
- **Affected users**: How many users experienced each error
- **Last seen**: When error last occurred
- **Trend graph**: Error frequency over time

### Email Alerts

By default, you'll receive email alerts for:
- Every new unique error
- Resurfaced errors (errors that return after being resolved)

Configure alerts in: Sentry → Settings → Alerts

### Issue Details

Click any error to see:
- **Stack trace**: Exact line of code that failed
- **Breadcrumbs**: User actions leading up to error
- **User context**: Which user experienced it
- **Device info**: Browser, OS, screen size
- **Session replay**: Watch video of user session (if error occurred)

## Debugging with Source Maps

When you deploy to production, Next.js minifies your code. Without source maps, error stack traces look like:

```
at a.map (chunk-ABC123.js:1:2345)
```

With source maps uploaded to Sentry:

```
at EventCard.tsx:42:15
at map (Array.prototype.map)
at EventList.tsx:89:20
```

Much easier to debug!

### Vercel Automatic Source Maps

If deploying to Vercel:
1. Install Sentry Vercel integration: [vercel.com/integrations/sentry](https://vercel.com/integrations/sentry)
2. Source maps will upload automatically on each deployment
3. No need to set `SENTRY_AUTH_TOKEN` manually

### Manual Source Map Upload

If not using Vercel integration:
1. Set `SENTRY_AUTH_TOKEN` in environment variables
2. Source maps upload automatically during `next build`
3. Verify in Sentry → Settings → Source Maps

## Performance Monitoring (Optional)

Sentry also supports performance monitoring (track slow pages, API calls):

To enable:
1. Go to Sentry → Performance
2. Click "Set Up Performance"
3. Already configured in code - just need to enable in dashboard

Performance monitoring counts against error quota in free tier, so consider upgrading if you want both.

## Files Modified

### Created
- `sentry.client.config.ts` - Client-side Sentry initialization
- `sentry.server.config.ts` - Server-side Sentry initialization
- `sentry.edge.config.ts` - Edge runtime Sentry initialization
- `instrumentation.ts` - Next.js instrumentation hook
- `src/components/error/ErrorBoundary.tsx` - React error boundary
- `src/app/global-error.tsx` - Global error handler
- `SENTRY_SETUP.md` - This file

### Modified
- `next.config.js` - Wrapped with Sentry config
- `src/app/layout.tsx` - Added ErrorBoundary wrapper
- `.env.local.example` - Added Sentry environment variables

## Common Issues

### "Sentry DSN is not configured"

**Solution:** Make sure `NEXT_PUBLIC_SENTRY_DSN` is set in `.env.local` and restart dev server.

### Errors not appearing in Sentry

**Checklist:**
- [ ] Is `NEXT_PUBLIC_SENTRY_DSN` set correctly?
- [ ] Did you restart the dev server after adding env var?
- [ ] Is the error actually being thrown? (Check browser console)
- [ ] Are you in development mode? (Sentry works in both dev and prod)

### Source maps not working

**Checklist:**
- [ ] Is `SENTRY_AUTH_TOKEN` set in environment variables?
- [ ] Does the auth token have correct scopes?
- [ ] Did the build complete successfully?
- [ ] Check Sentry → Settings → Source Maps to verify upload

### Too many errors (hitting free tier limit)

**Solutions:**
1. Filter more aggressively in `sentry.client.config.ts`
2. Increase sample rate (only send 50% of errors): `sampleRate: 0.5`
3. Fix the most common errors first
4. Upgrade to paid plan

## Best Practices

### 1. Use Contexts for Additional Info

Add extra context to errors:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.setContext('event', {
  id: eventId,
  name: eventName,
  phase: currentPhase,
});

// Now all errors will include this context
```

### 2. Tag Errors for Filtering

```typescript
Sentry.setTag('section', 'voting');
Sentry.setTag('feature', 'submission');

// Filter in Sentry dashboard by tag
```

### 3. Capture User Info

```typescript
Sentry.setUser({
  id: user.uid,
  email: user.email,
  username: user.displayName,
});
```

### 4. Manually Capture Errors

For caught errors you want to track:

```typescript
try {
  await submitProject(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: { action: 'project_submission' },
    extra: { projectId, userId },
  });
  // Show user-friendly error message
}
```

### 5. Breadcrumbs for Debugging

Add manual breadcrumbs for important actions:

```typescript
Sentry.addBreadcrumb({
  category: 'voting',
  message: 'User submitted vote',
  level: 'info',
  data: { projectId, rating },
});
```

## Next Steps

1. **Set up Sentry account** (free)
2. **Add DSN to environment variables**
3. **Deploy and test** - trigger an error in production
4. **Configure alerts** - decide who gets notified
5. **Resolve your first issue** - mark it as resolved in Sentry dashboard

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Error Boundary Best Practices](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
