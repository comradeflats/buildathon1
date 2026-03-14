export function generateSubmissionCode(length: number = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 to avoid confusion
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export type EventStatus = 'upcoming' | 'active' | 'archived';

export function getEventStatus(startDate: string, endDate: string, hasThemes: boolean = true, isLive: boolean = false): EventStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Manual override takes precedence
  if (isLive) return 'active';

  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    // Safety Rail: Only active if themes are ready
    return hasThemes ? 'active' : 'upcoming';
  } else {
    return 'archived';
  }
}

import { REGIONS, Region } from './constants';

export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number, region?: Region } | null> {
  if (!query || query.trim().length < 3) return null;

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Helper to map country to region
  const getRegionFromCountry = (country: string, countryCode?: string): Region | undefined => {
    const c = country.toLowerCase();
    const code = countryCode?.toUpperCase();

    // SE Asia
    if (['vietnam', 'thailand', 'indonesia', 'malaysia', 'singapore', 'philippines', 'cambodia', 'laos', 'myanmar', 'brunei', 'timor-leste'].includes(c) || 
        ['VN', 'TH', 'ID', 'MY', 'SG', 'PH', 'KH', 'LA', 'MM', 'BN', 'TL'].includes(code || '')) return 'SE Asia';
    
    // East Asia
    if (['china', 'japan', 'south korea', 'north korea', 'taiwan', 'mongolia'].includes(c) ||
        ['CN', 'JP', 'KR', 'KP', 'TW', 'MN'].includes(code || '')) return 'East Asia';
    
    // South Asia
    if (['india', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'bhutan', 'maldives'].includes(c) ||
        ['IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV'].includes(code || '')) return 'South Asia';
    
    // North America
    if (['usa', 'united states', 'canada', 'mexico'].includes(c) ||
        ['US', 'CA', 'MX'].includes(code || '')) return 'North America';
    
    // South America
    if (['brazil', 'argentina', 'chile', 'colombia', 'peru', 'ecuador', 'bolivia', 'paraguay', 'uruguay', 'venezuela', 'guyana', 'suriname'].includes(c) ||
        ['BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'BO', 'PY', 'UY', 'VE', 'GY', 'SR'].includes(code || '')) return 'South America';

    // Oceania
    if (['australia', 'new zealand', 'fiji', 'papua new guinea'].includes(c) ||
        ['AU', 'NZ', 'FJ', 'PG'].includes(code || '')) return 'Oceania';
    
    // Middle East
    if (['uae', 'united arab emirates', 'saudi arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'israel', 'jordan', 'lebanon', 'turkey'].includes(c) ||
        ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'IL', 'JO', 'LB', 'TR'].includes(code || '')) return 'Middle East';

    // Europe (broad check)
    if (['uk', 'united kingdom', 'france', 'germany', 'italy', 'spain', 'netherlands', 'belgium', 'switzerland', 'austria', 'portugal', 'greece', 'poland', 'sweden', 'norway', 'denmark', 'finland', 'ireland'].includes(c) ||
        ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'PT', 'GR', 'PL', 'SE', 'NO', 'DK', 'FI', 'IE'].includes(code || '')) return 'Europe';

    // Africa (broad check)
    if (['nigeria', 'egypt', 'south africa', 'kenya', 'ethiopia', 'ghana', 'morocco', 'algeria', 'tunisia', 'uganda', 'tanzania'].includes(c) ||
        ['NG', 'EG', 'ZA', 'KE', 'ET', 'GH', 'MA', 'DZ', 'TN', 'UG', 'TZ'].includes(code || '')) return 'Africa';

    return undefined;
  };

  // Try Google Maps first
  if (googleApiKey && googleApiKey !== 'placeholder-key') {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results?.[0]) {
        const result = data.results[0];
        const countryComp = result.address_components.find((c: any) => c.types.includes('country'));
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          region: countryComp ? getRegionFromCountry(countryComp.long_name, countryComp.short_name) : undefined
        };
      }
    } catch (error) {
      console.error('[GEO] Google Maps Geocoding error:', error);
    }
  }

  // Fallback to Nominatim (OSM)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'BuildathonArenaExplorer/1.0'
        }
      }
    );

    const data = await response.json();
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        region: result.address?.country ? getRegionFromCountry(result.address.country, result.address.country_code) : undefined
      };
    }
    return null;
  } catch (error) {
    console.error('[GEO] Nominatim error:', error);
    return null;
  }
}
