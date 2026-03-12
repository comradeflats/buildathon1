# Security Architecture Interview

Use these questions to understand the project's security posture when the user is a novice. Ask them one or two at a time to avoid overwhelming the user.

## Core Architecture
- **Environment Management**: How are you handling sensitive values like API keys and database credentials? (e.g., `.env.local`, CI/CD secrets)
- **Data Sensitivity**: What kind of data are you storing? Is there any Personally Identifiable Information (PII) like emails or phone numbers?
- **User Roles**: Do you have different types of users (e.g., Admins, Participants, Judges)? How do you distinguish between them in your code?

## Firebase Specifics
- **Firestore Rules**: Have you locked down your database rules to prevent anyone from reading/writing all data?
- **Authentication**: Which sign-in methods are enabled (Google, Email/Password, etc.)?
- **Storage**: Are you storing files (images, PDFs)? If so, how are the access rules configured?

## Deployment & Network
- **Production URL**: Where is the site hosted? (e.g., Vercel, Firebase Hosting, AWS)
- **Domain Security**: Is SSL (HTTPS) forced on your domain?
- **Security Headers**: Are you using headers like Content Security Policy (CSP) or Strict-Transport-Security (HSTS)?

## Event-Specific Risks
- **Live Voting**: How do you prevent users from voting multiple times?
- **Public Submissions**: Can anyone upload a project, or only registered teams?
- **Leaderboard Integrity**: How is the scoring calculated? Is the logic executed on the client or the server?
