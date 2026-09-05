// Client service for querying and submitting Rush 2026 Tour Fan Meetups & Gatherings

export interface Meetup {
  id: string;
  name: string;
  tour_city: string;
  venue_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  start_time?: string;
  description?: string;
  organizer_name?: string;
  rsvp_link?: string;
  category?: 'tailgate' | 'pub_crawl' | 'tribute_band' | 'listening_party';
  status?: 'approved' | 'pending_review';
  distance_miles?: number;
}

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

export const DEFAULT_MEETUPS: Meetup[] = [
  {
    id: 'cincinnati-01',
    name: 'Queen City Riverfront Rush Rally (New Tour Date)',
    tour_city: 'Cincinnati',
    venue_name: 'The Banks on Freedom Way',
    address: '100 Joe Nuxhall Way, Cincinnati, OH 45202',
    event_date: '2026-10-23',
    start_time: '15:30',
    description: 'Riverfront patio gathering steps away from Heritage Bank Center. Rush trivia, craft taps, and fan prize giveaways.',
    organizer_name: 'Ohio Valley Rush Fanatics',
    rsvp_link: 'https://rush.com/tour',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'houston-01',
    name: 'Space City Rush Tailgate (New Tour Date)',
    tour_city: 'Houston',
    venue_name: 'Toyota Center Plaza',
    address: '1510 Polk St, Houston, TX 77002',
    event_date: '2026-10-01',
    start_time: '16:30',
    description: 'Newly added tour date celebration! Texas fans pre-show tailgate outside Toyota Center with Texas BBQ & Rush playlist.',
    organizer_name: 'Lone Star Rush Society',
    rsvp_link: 'https://rush.com/tour',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'stlouis-01',
    name: 'Gateway Arch Fan Gathering (New Tour Date)',
    tour_city: 'St. Louis',
    venue_name: 'Enterprise Center Atrium & Beer Garden',
    address: '1401 Clark Ave, St. Louis, MO 63103',
    event_date: '2026-10-21',
    start_time: '16:00',
    description: 'Pre-concert drinks and tour merchandise swap across from Enterprise Center before the newly added St. Louis show.',
    organizer_name: 'Gateway Rush Legion',
    rsvp_link: 'https://rush.com/tour',
    category: 'pub_crawl',
    status: 'approved'
  },
  {
    id: 'pittsburgh-01',
    name: 'Steel City Working Men Meetup (New Tour Date)',
    tour_city: 'Pittsburgh',
    venue_name: 'Souper Bowl Bar & Grill',
    address: '910 5th Ave, Pittsburgh, PA 15219',
    event_date: '2026-11-15',
    start_time: '16:00',
    description: 'Pre-show gathering for the newly announced November Pittsburgh date. Working Man specials and live Rush concert videos.',
    organizer_name: 'Pittsburgh Rush Coalition',
    rsvp_link: 'https://rush.com/tour',
    category: 'pub_crawl',
    status: 'approved'
  },
  {
    id: 'toronto-01',
    name: 'RushCon Toronto Pre-Show Gathering',
    tour_city: 'Toronto',
    venue_name: 'The Loose Moose Tap & Grill',
    address: '146 Front St W, Toronto, ON M5J 1G2',
    event_date: '2026-08-14',
    start_time: '15:00',
    description: 'Official pre-concert fan gathering 2 blocks from Scotiabank Arena. Rush trivia contest, craft beer, and Rush playlist all afternoon.',
    organizer_name: 'RushCon Fan Club',
    rsvp_link: 'https://rushcon.org/toronto2026',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'toronto-02',
    name: 'YYZ Tribute Band Afterparty',
    tour_city: 'Toronto',
    venue_name: 'Horseshoe Tavern',
    address: '370 Queen St W, Toronto, ON M5V 2A2',
    event_date: '2026-08-14',
    start_time: '23:00',
    description: 'Post-concert afterparty featuring live Rush cover set by YYZ Tribute band. Late night poutine & drinks.',
    organizer_name: 'Toronto Rush Faithful',
    rsvp_link: 'https://horseshoetavern.com/events',
    category: 'tribute_band',
    status: 'approved'
  },
  {
    id: 'chicago-01',
    name: 'Windy City Pre-Show Tailgate & BBQ',
    tour_city: 'Chicago',
    venue_name: 'United Center Lot C',
    address: '1901 W Madison St, Chicago, IL 60612',
    event_date: '2026-08-22',
    start_time: '14:00',
    description: 'Big fan tailgate in Lot C with bratwurst, Rush flags, and boomboxes playing bootlegs. Look for the red Starman canopy.',
    organizer_name: 'Midwest Rush Mob',
    rsvp_link: 'https://facebook.com/groups/midwestrushfans',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'nyc-01',
    name: 'Subdivisions Pub Crawl NYC',
    tour_city: 'New York',
    venue_name: 'The Pennsy Food Hall & Bar',
    address: '2 Pennsylvania Plaza, New York, NY 10121',
    event_date: '2026-09-05',
    start_time: '16:00',
    description: 'Gathering right above Penn Station / MSG before the show. Drink specials for fans wearing Rush tour shirts.',
    organizer_name: 'NYC Rush Meetup Group',
    rsvp_link: 'https://meetup.com/nyc-rush-fans',
    category: 'pub_crawl',
    status: 'approved'
  },
  {
    id: 'cleveland-01',
    name: 'Rock & Roll Hall of Fame Neil Peart Tribute Meetup',
    tour_city: 'Cleveland',
    venue_name: 'Rock & Roll Hall of Fame Plaza',
    address: '1100 E 9th St, Cleveland, OH 44114',
    event_date: '2026-09-12',
    start_time: '12:00',
    description: 'Fan photo on the plaza in front of Neil Peart drum exhibit before heading to Rocket Mortgage FieldHouse.',
    organizer_name: 'Cleveland Rush Section',
    rsvp_link: 'https://rockhall.com/events',
    category: 'listening_party',
    status: 'approved'
  },
  {
    id: 'la-01',
    name: 'Southern California Signals Tailgate',
    tour_city: 'Los Angeles',
    venue_name: 'Kia Forum Parking Lot E',
    address: '3900 W Manchester Blvd, Inglewood, CA 90305',
    event_date: '2026-06-07',
    start_time: '14:00',
    description: 'Tour kickoff celebration outside the Forum. California sunshine, taco trucks, and hundreds of Rush fans.',
    organizer_name: 'SoCal Rush Family',
    rsvp_link: 'https://rush.com/tour',
    category: 'tailgate',
    status: 'approved'
  },
  {
    id: 'boston-01',
    name: 'Causeway Street Fan Crawl',
    tour_city: 'Boston',
    venue_name: 'The Fours Bar & Hub on Causeway',
    address: '52 Causeway St, Boston, MA 02114',
    event_date: '2026-09-18',
    start_time: '16:00',
    description: 'Pre-show gathering right next to TD Garden. Classic rock jukebox takeover and commemorative tour badges.',
    organizer_name: 'New England Rush Syndicate',
    rsvp_link: 'https://rush.com/tour',
    category: 'pub_crawl',
    status: 'approved'
  }
];

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
