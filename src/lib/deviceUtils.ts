export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  // Check for touch capability and screen size
  const isTouchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  // Catch mobile user agents or touch devices that are smaller than standard desktop monitors
  return mobileRegex.test(userAgent) || (isTouchDevice && window.innerWidth < 1024);
}
