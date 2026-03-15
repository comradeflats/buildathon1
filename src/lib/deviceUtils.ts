export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();

  // Explicit mobile/tablet user agents (comprehensive list)
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|silk|kindle|playbook|bb10|meego/i;
  const isMobileUA = mobileRegex.test(userAgent);

  // Check for specific mobile browsers
  const isChromeMobile = /chrome/i.test(userAgent) && /mobile/i.test(userAgent);
  const isFirefoxMobile = /firefox/i.test(userAgent) && /mobile/i.test(userAgent);
  const isSafariMobile = /safari/i.test(userAgent) && /mobile/i.test(userAgent);

  // Check for in-app browsers (Instagram, Facebook, Twitter, etc.)
  const isInAppBrowser = /instagram|fbav|fban|twitter|line|snapchat|tiktok|whatsapp/i.test(userAgent);

  // Check for touch capability
  const isTouchDevice =
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    ((navigator as any).msMaxTouchPoints > 0);

  // Modern iPads report as "Macintosh" but have touch points
  const isIPad = /macintosh/i.test(userAgent) && isTouchDevice && window.innerWidth <= 1366;

  // Check screen size (mobile typically < 1024px)
  const isMobileScreenSize = window.innerWidth < 1024;

  const result = isMobileUA || isChromeMobile || isFirefoxMobile || isSafariMobile ||
                 isInAppBrowser || isIPad || (isTouchDevice && isMobileScreenSize);

  // Debug logging
  console.log('[DEVICE] Mobile detection:', {
    isMobileUA,
    isChromeMobile,
    isFirefoxMobile,
    isSafariMobile,
    isInAppBrowser,
    isIPad,
    isTouchDevice,
    isMobileScreenSize,
    screenWidth: window.innerWidth,
    userAgent: userAgent.substring(0, 50) + '...',
    result
  });

  return result;
}
