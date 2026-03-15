/**
 * reCAPTCHA v3 Integration
 *
 * Provides invisible spam protection for forms without user interaction.
 * Score-based: 0.0 (bot) to 1.0 (human)
 *
 * Setup: https://www.google.com/recaptcha/admin
 */

/**
 * Client-side: Execute reCAPTCHA and get token
 *
 * @param action - Action name (e.g., 'register', 'contact', 'submit')
 * @returns Promise<string> - reCAPTCHA token
 */
export async function executeRecaptcha(action: string): Promise<string | null> {
  // Check if reCAPTCHA is loaded
  if (typeof window === 'undefined' || !(window as any).grecaptcha) {
    console.warn('[RECAPTCHA] reCAPTCHA not loaded. Ensure script is included in page.');
    return null;
  }

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    console.warn('[RECAPTCHA] Site key not configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.');
    return null;
  }

  try {
    await (window as any).grecaptcha.ready();
    const token = await (window as any).grecaptcha.execute(siteKey, { action });
    console.log('[RECAPTCHA] Token generated for action:', action);
    return token;
  } catch (error) {
    console.error('[RECAPTCHA] Failed to execute:', error);
    return null;
  }
}

/**
 * Server-side: Verify reCAPTCHA token
 *
 * @param token - Token from client-side executeRecaptcha()
 * @param expectedAction - Expected action name (for validation)
 * @param minScore - Minimum acceptable score (default: 0.5)
 * @returns Promise<{success: boolean, score?: number, error?: string}>
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  minScore: number = 0.5
): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('[RECAPTCHA] Secret key not configured. Set RECAPTCHA_SECRET_KEY.');
    // In development, allow requests to pass through if reCAPTCHA is not configured
    if (process.env.NODE_ENV === 'development') {
      console.warn('[RECAPTCHA] Development mode: Allowing request without verification.');
      return { success: true, score: 1.0 };
    }
    return { success: false, error: 'reCAPTCHA not configured' };
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    console.log('[RECAPTCHA] Verification response:', {
      success: data.success,
      score: data.score,
      action: data.action,
      expectedAction,
    });

    // Check if verification succeeded
    if (!data.success) {
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${data['error-codes']?.join(', ') || 'Unknown error'}`,
      };
    }

    // Check action matches (if provided)
    if (expectedAction && data.action !== expectedAction) {
      return {
        success: false,
        error: `Action mismatch: expected ${expectedAction}, got ${data.action}`,
      };
    }

    // Check score meets minimum threshold
    if (data.score < minScore) {
      console.warn('[RECAPTCHA] Low score detected:', {
        score: data.score,
        minScore,
        action: data.action,
      });
      return {
        success: false,
        score: data.score,
        error: `Score too low: ${data.score} < ${minScore} (likely bot)`,
      };
    }

    // Success!
    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error('[RECAPTCHA] Verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Helper: Check if reCAPTCHA is configured
 */
export function isRecaptchaConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY &&
    process.env.RECAPTCHA_SECRET_KEY
  );
}

/**
 * TypeScript global extension for grecaptcha
 */
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
