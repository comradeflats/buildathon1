# reCAPTCHA v3 Setup Guide

## What is reCAPTCHA v3?

reCAPTCHA v3 is Google's invisible spam protection that works without requiring any user interaction (no "I'm not a robot" checkboxes or image challenges). It scores each request from 0.0 (definitely a bot) to 1.0 (definitely a human) based on user behavior.

## Features

- ✅ **Invisible**: No user interaction required
- ✅ **Score-based**: Flexible threshold configuration
- ✅ **Free**: Unlimited requests for most websites
- ✅ **Privacy-friendly**: GDPR compliant
- ✅ **Easy integration**: Just a few lines of code

## Where It's Used

Currently protecting:
- **Event Registration** - Prevents bots from filling up events
- **Contact Form** - Blocks spam messages (when implemented)

Can be added to:
- Project submissions
- Account creation
- Voting
- Any form that could be abused

## Setup Instructions

### 1. Register Your Site

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label**: buildathon.live
   - **reCAPTCHA type**: ✅ reCAPTCHA v3
   - **Domains**:
     - `buildathon.live`
     - `www.buildathon.live`
     - `localhost` (for development)
   - **Owners**: (your email)
   - **Accept the reCAPTCHA Terms of Service**: ✅
4. Click **Submit**

### 2. Get Your Keys

After registration, you'll receive:
- **Site Key** (starts with `6L...`) - Public, used in frontend
- **Secret Key** (starts with `6L...`) - Private, used in backend

### 3. Configure Environment Variables

Add to `.env.local`:

```bash
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

For production (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add both keys
3. Redeploy

### 4. Test reCAPTCHA

1. Restart your dev server: `npm run dev`
2. Open browser console (F12)
3. Try registering for an event
4. Look for these console messages:
   ```
   [RECAPTCHA] Token generated for action: register
   [REGISTER] reCAPTCHA verified. Score: 0.9
   ```

## How It Works

### Client-Side Flow

1. **User fills out form** (e.g., event registration)
2. **User clicks submit**
3. **`executeRecaptcha('register')`** is called
4. **reCAPTCHA analyzes user behavior** (mouse movements, typing patterns, browsing history)
5. **Token is generated** (valid for 2 minutes)
6. **Token is sent to backend** with form data

### Server-Side Flow

1. **Backend receives request** with reCAPTCHA token
2. **`verifyRecaptcha(token)`** is called
3. **Google verifies token** and returns score (0.0-1.0)
4. **Score is checked against threshold** (default: 0.5)
5. **If score >= 0.5**: Request is allowed
6. **If score < 0.5**: Request is rejected (likely bot)

## Score Thresholds

Different actions can have different thresholds:

| Score | Interpretation | Recommendation |
|-------|----------------|----------------|
| 0.9-1.0 | Definitely human | Always allow |
| 0.7-0.9 | Probably human | Allow |
| 0.5-0.7 | Unclear | Allow with monitoring |
| 0.3-0.5 | Probably bot | Reject or require additional verification |
| 0.0-0.3 | Definitely bot | Reject |

**Current Configuration:**
- Event registration: **0.5** (balanced)
- Contact form: **0.5** (balanced)

To adjust, edit `/src/app/api/events/[eventId]/register/route.ts`:
```typescript
const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'register', 0.7); // Stricter
```

## Monitoring Scores

### View Scores in Logs

Check your server logs (Vercel logs or local console):
```
[RECAPTCHA] Verification response: { success: true, score: 0.9, action: 'register' }
[REGISTER] reCAPTCHA verified. Score: 0.9
```

### View Analytics in Google Admin

1. Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click on your site
3. View:
   - **Requests**: How many reCAPTCHA requests you've received
   - **Score distribution**: How many requests fell into each score range
   - **Top domains**: Which domains are making requests
   - **Top actions**: Which actions are being verified (register, submit, etc.)

## Common Issues

### "reCAPTCHA not loaded"

**Symptom**: Console warning: `[RECAPTCHA] reCAPTCHA not loaded`

**Solution**:
- Ensure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
- Check that reCAPTCHA script is loading in page `<head>`
- Open Network tab in DevTools and look for `recaptcha/api.js`
- Clear browser cache and reload

### "Site key not configured"

**Symptom**: Console warning: `[RECAPTCHA] Site key not configured`

**Solution**:
- Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` to `.env.local`
- Restart dev server: `npm run dev`
- Verify env var is loaded: `console.log(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)`

### "Low score detected"

**Symptom**: Request rejected with error: "Spam detection triggered"

**Possible Causes**:
- **User is in private/incognito mode** (no browsing history → low score)
- **User is on VPN** (suspicious IP → low score)
- **User is actually a bot** (automated behavior → low score)
- **Browser has disabled JavaScript** (can't generate token → no score)

**Solutions**:
1. Lower threshold from 0.5 to 0.3 (less strict)
2. Add fallback for low scores (e.g., require email verification)
3. Allow users to contact support if falsely blocked

### "reCAPTCHA verification failed: invalid-input-response"

**Symptom**: Error in server logs

**Solution**:
- Token expired (valid for 2 minutes) - user left form open too long
- Token already used - don't reuse tokens
- Wrong secret key - verify `RECAPTCHA_SECRET_KEY` matches site

### Domain not authorized

**Symptom**: Console error: "ERROR for site owner: Invalid domain for site key"

**Solution**:
1. Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click on your site
3. Click "Settings" (gear icon)
4. Add your domain to the "Domains" list
5. Save changes

## Development Mode Bypass

In development, if reCAPTCHA is not configured, requests are allowed to pass through:

```typescript
// From /src/lib/recaptcha.ts
if (process.env.NODE_ENV === 'development') {
  console.warn('[RECAPTCHA] Development mode: Allowing request without verification.');
  return { success: true, score: 1.0 };
}
```

This allows you to develop without setting up reCAPTCHA immediately.

**⚠️ Important**: Remove this bypass before deploying to production!

## Adding reCAPTCHA to Other Forms

### Example: Contact Form

**Client-Side** (`/src/components/contact/ContactForm.tsx`):
```typescript
import { executeRecaptcha } from '@/lib/recaptcha';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Generate token
  const recaptchaToken = await executeRecaptcha('contact');

  // Send to backend
  await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ ...formData, recaptchaToken }),
  });
};
```

**Server-Side** (`/src/app/api/contact/route.ts`):
```typescript
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  const { recaptchaToken, ...data } = await request.json();

  // Verify token
  const result = await verifyRecaptcha(recaptchaToken, 'contact', 0.5);
  if (!result.success) {
    return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
  }

  // Process form...
}
```

## Best Practices

### 1. Use Specific Action Names

Each form should have a unique action name:
```typescript
executeRecaptcha('register')   // Event registration
executeRecaptcha('contact')    // Contact form
executeRecaptcha('submit')     // Project submission
executeRecaptcha('vote')       // Voting
```

This helps with:
- Analytics (see which actions are being abused)
- Security (validate action matches expected value)
- Debugging (trace errors to specific forms)

### 2. Handle Errors Gracefully

Don't block users with technical errors:
```typescript
const recaptchaToken = await executeRecaptcha('register');
if (!recaptchaToken) {
  console.warn('reCAPTCHA failed to generate token, allowing request');
  // Continue anyway - don't block user
}
```

### 3. Log Low Scores for Monitoring

Track low scores to adjust thresholds:
```typescript
if (data.score < minScore) {
  console.warn('[RECAPTCHA] Low score detected:', {
    score: data.score,
    minScore,
    action: data.action,
    userAgent: request.headers.get('user-agent'),
  });
}
```

### 4. Combine with Rate Limiting

reCAPTCHA alone isn't enough. Also implement:
- **Rate limiting**: Max 5 requests per minute per IP
- **Email verification**: Verify email addresses are real
- **Account age**: Require accounts to be > 24 hours old for sensitive actions

### 5. Don't Rely Solely on reCAPTCHA

reCAPTCHA can be bypassed by determined attackers. Use it as one layer of defense:
- ✅ reCAPTCHA (score-based filtering)
- ✅ Rate limiting (prevent rapid-fire requests)
- ✅ Email verification (verify ownership)
- ✅ Manual review (flag suspicious registrations)

## Files Modified

### Created
- `/src/lib/recaptcha.ts` - reCAPTCHA client and server utilities
- `RECAPTCHA_SETUP.md` - This guide

### Modified
- `/src/app/layout.tsx` - Added reCAPTCHA script to `<head>`
- `/src/app/api/events/[eventId]/register/route.ts` - Added verification
- `/src/components/events/RegisterModal.tsx` - Added token generation
- `.env.local.example` - Added example env vars

## Resources

- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA v3 Docs](https://developers.google.com/recaptcha/docs/v3)
- [Score Interpretation](https://developers.google.com/recaptcha/docs/v3#interpreting_the_score)
- [FAQ](https://developers.google.com/recaptcha/docs/faq)

## Next Steps

1. ✅ Set up reCAPTCHA account
2. ✅ Add keys to environment variables
3. ✅ Test event registration
4. 🔲 Monitor scores in Google Admin
5. 🔲 Adjust thresholds based on data
6. 🔲 Add to contact form (when implemented)
7. 🔲 Add to project submission (optional)
