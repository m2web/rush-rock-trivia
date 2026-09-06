// Client service for querying and submitting Rush 2026 Tour Fan Meetups & Gatherings

export { Meetup, DEFAULT_MEETUPS } from '../data/defaultMeetups';
import { Meetup, DEFAULT_MEETUPS } from '../data/defaultMeetups';

export interface PartiesResponse {
  detectedLocation: {
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    source: string;
  };
  count: number;
  parties: Meetup[];
}

export async function fetchTourParties(params?: {
  city?: string;
  lat?: number;
  lon?: number;
  category?: string;
  radius?: number;
}): Promise<PartiesResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.city) query.set('city', params.city);
    if (params?.lat !== undefined) query.set('lat', params.lat.toString());
    if (params?.lon !== undefined) query.set('lon', params.lon.toString());
    if (params?.category) query.set('category', params.category);
    if (params?.radius !== undefined) query.set('radius', params.radius.toString());

    const response = await fetch(`/api/parties${query.toString() ? '?' + query.toString() : ''}`);
    if (response.ok) {
      const data = await response.json();
      // Accept the response whenever parties is a valid array, even if empty
      if (data && Array.isArray(data.parties)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network error fetching live parties, using defaults:', err);
  }

  // Safe fallback to default meetups only if API is unreachable or returned invalid data
  let filtered = [...DEFAULT_MEETUPS];
  if (params?.city && params.city !== 'All Cities') {
    filtered = filtered.filter(p => p.tour_city.toLowerCase() === params.city!.toLowerCase());
  }
  if (params?.category) {
    filtered = filtered.filter(p => p.category === params.category);
  }

  return {
    detectedLocation: { city: null, latitude: null, longitude: null, source: 'default' },
    count: filtered.length,
    parties: filtered,
  };
}

export async function submitTourParty(meetup: Partial<Meetup>): Promise<{ success: boolean; message: string; meetup: Meetup }> {
  const response = await fetch('/api/parties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meetup),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || `Submission failed with status ${response.status}`);
  }

  return response.json();
}
