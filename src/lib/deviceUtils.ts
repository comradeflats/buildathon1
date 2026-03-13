export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Explicit mobile/tablet user agents
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  const isMobileUA = mobileRegex.test(userAgent);

  // Check for touch capability
  const isTouchDevice = 
    ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    ((navigator as any).msMaxTouchPoints > 0);
    
  // A device is "mobile" if it's explicitly a mobile UA, OR
  // it's a touch device with a screen smaller than typical desktops (1024px).
  // Note: Modern iPads report as "Macintosh" but have touch points.
  const isIPad = /macintosh/i.test(userAgent) && isTouchDevice && window.innerWidth <= 1366;
  
  return isMobileUA || (isTouchDevice && window.innerWidth < 1024) || isIPad;
}
