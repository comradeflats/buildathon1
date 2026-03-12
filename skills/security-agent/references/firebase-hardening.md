# Firebase Hardening for Live Projects

## 1. Firestore Security Rules
Ensure rules are as granular as possible.
- **Principle of Least Privilege**: Default to `allow read, write: if false;` and only open what's needed.
- **Resource Ownership**: `allow update: if request.auth.uid == resource.data.ownerId;`
- **Schema Validation**: Use `request.resource.data` to validate the shape and content of incoming data.

## 2. Authentication Security
- **Email/Password**: Enforce strong password policies if using native Firebase Auth.
- **Identity Providers**: Use trusted providers like Google, GitHub, or Microsoft to offload authentication security.
- **Token Claims**: Use Custom Claims for roles (e.g., `admin`, `judge`) instead of storing roles in a `users` collection.

## 3. Firebase Cloud Functions
If you're using Cloud Functions, follow these:
- **Environment Secrets**: Use Firebase Functions Secret Manager for API keys.
- **Input Sanitization**: Always validate inputs to functions.
- **Auth Checks**: `if (!context.auth) throw new functions.https.HttpsError('unauthenticated', ...);`

## 4. Storage Rules
If using Firebase Storage for images/PDFs:
- **MIME Type Check**: `allow write: if request.resource.contentType.matches('image/.*');`
- **File Size Limit**: `allow write: if request.resource.size < 5 * 1024 * 1024; // 5MB limit`

## 5. Next.js Security
- **Server Actions**: Always validate authentication and authorization at the top of every Server Action.
- **Middleware**: Use Middleware to protect `/admin` or `/dashboard` routes.
- **Security Headers**: Configure `next.config.js` with `Content-Security-Policy`, `X-Frame-Options`, and `Referrer-Policy`.
- **Environment Variables**: Ensure sensitive keys do not have the `NEXT_PUBLIC_` prefix.
