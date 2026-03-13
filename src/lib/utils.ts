export function generateSubmissionCode(length: number = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 to avoid confusion
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export type EventStatus = 'upcoming' | 'active' | 'archived';

export function getEventStatus(startDate: string, endDate: string): EventStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'archived';
  }
}

export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query || query.trim().length < 3) return null;

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('[GEO] googleApiKey present:', !!googleApiKey && googleApiKey !== 'placeholder-key');

  // Try Google Maps first if API key is present
  if (googleApiKey && googleApiKey !== 'placeholder-key') {
    try {
      console.log('[GEO] Attempting Google Maps Geocoding...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng
        };
      }
      console.warn('[GEO] Google Maps Geocoding failed or returned no results:', data.status);
    } catch (error) {
      console.error('[GEO] Google Maps Geocoding error:', error);
    }
  }

  // Fallback to Nominatim (OSM)
  try {
    console.log('[GEO] Falling back to Nominatim...');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'BuildathonArenaExplorer/1.0'
        }
      }
    );

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('[GEO] Nominatim error:', error);
    return null;
  }
}
