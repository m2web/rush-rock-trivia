// Baseline fallback seed dataset for Rush 2026-2027 Tour Fan Meetups & Gatherings
// Used as in-memory fallback for client services and Cloudflare Pages Functions when D1 is offline

export interface Meetup {
  id: string;
  name: string;
  tour_city: string;
  venue_name: string;
  venue_url?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  event_date: string;
  start_time?: string | null;
  description?: string | null;
  organizer_name?: string | null;
  rsvp_link?: string | null;
  category?: 'tailgate' | 'pub_crawl' | 'tribute_band' | 'listening_party' | null;
  status?: 'approved' | 'pending_review' | null;
  distance_miles?: number | null;
  is_example?: boolean | number | null;
}

export const DEFAULT_MEETUPS: Meetup[] = [
  {
    id: 'toronto-01',
    name: '[Example] RushCon Toronto Pre-Show Gathering',
    tour_city: 'Toronto',
    venue_name: 'The Loose Moose Tap & Grill',
    venue_url: 'https://theloosemoose.ca',
    address: '146 Front St W, Toronto, ON M5J 1G2',
    latitude: 43.6456,
    longitude: -79.3849,
    event_date: '2026-08-14',
    start_time: '15:00',
    description: 'Official pre-concert fan gathering 2 blocks from Scotiabank Arena. Rush trivia contest, craft beer, and Rush playlist all afternoon.',
    organizer_name: 'RushCon Fan Club',
    rsvp_link: 'https://rushcon.org/toronto2026',
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'toronto-02',
    name: '[Example] YYZ Tribute Band Afterparty',
    tour_city: 'Toronto',
    venue_name: 'Horseshoe Tavern',
    venue_url: 'https://horseshoetavern.com',
    address: '370 Queen St W, Toronto, ON M5V 2A2',
    latitude: 43.6499,
    longitude: -79.3957,
    event_date: '2026-08-14',
    start_time: '23:00',
    description: 'Post-concert afterparty featuring live Rush cover set by YYZ Tribute band. Late night poutine & drinks.',
    organizer_name: 'Toronto Rush Faithful',
    rsvp_link: 'https://horseshoetavern.com/events',
    category: 'tribute_band',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'chicago-01',
    name: '[Example] Windy City Pre-Show Tailgate & BBQ',
    tour_city: 'Chicago',
    venue_name: 'United Center Lot C',
    venue_url: 'https://www.unitedcenter.com',
    address: '1901 W Madison St, Chicago, IL 60612',
    latitude: 41.8807,
    longitude: -87.6742,
    event_date: '2026-08-22',
    start_time: '14:00',
    description: 'Big fan tailgate in Lot C with bratwurst, Rush flags, and boomboxes playing bootlegs. Look for the red Starman canopy.',
    organizer_name: 'Midwest Rush Mob',
    rsvp_link: 'https://facebook.com/groups/midwestrushfans',
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'nyc-01',
    name: '[Example] Subdivisions Pub Crawl NYC',
    tour_city: 'New York',
    venue_name: 'The Pennsy Food Hall & Bar',
    venue_url: 'https://www.thepennsy.nyc',
    address: '2 Pennsylvania Plaza, New York, NY 10121',
    latitude: 40.7505,
    longitude: -73.9934,
    event_date: '2026-09-05',
    start_time: '16:00',
    description: 'Gathering right above Penn Station / MSG before the show. Drink specials for fans wearing Rush tour shirts.',
    organizer_name: 'NYC Rush Meetup Group',
    rsvp_link: 'https://meetup.com/nyc-rush-fans',
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'cleveland-01',
    name: 'East 4th Street Pub Crawl',
    tour_city: 'Cleveland',
    venue_name: 'East 4th Street Entertainment District',
    venue_url: 'https://east4thstreet.com',
    address: '2187 E 4th St, Cleveland, OH 44115',
    latitude: 41.4993,
    longitude: -81.6879,
    event_date: '2026-09-17',
    start_time: '16:00',
    description: 'East 4th Street pub crawl before AND after the 7:30 PM Rush Fifty Something tour show at Rocket Arena!',
    organizer_name: 'Cleveland Rush Section',
    rsvp_link: 'https://east4thstreet.com',
    category: 'pub_crawl',
    status: 'approved',
    is_example: 0
  },
  {
    id: 'houston-01',
    name: '[Example] Space City Rush Tailgate (New Tour Date)',
    tour_city: 'Houston',
    venue_name: 'Toyota Center Plaza',
    venue_url: 'https://www.toyotacenter.com',
    address: '1510 Polk St, Houston, TX 77002',
    latitude: 29.7522,
    longitude: -95.3621,
    event_date: '2026-10-01',
    start_time: '16:30',
    description: 'Newly added tour date celebration! Texas fans pre-show tailgate outside Toyota Center with Texas BBQ & Rush playlist.',
    organizer_name: 'Lone Star Rush Society',
    rsvp_link: null,
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'stlouis-01',
    name: '[Example] Gateway Arch Fan Gathering (New Tour Date)',
    tour_city: 'St. Louis',
    venue_name: 'Enterprise Center Atrium & Beer Garden',
    venue_url: 'https://www.enterprisecenter.com',
    address: '1401 Clark Ave, St. Louis, MO 63103',
    latitude: 38.6268,
    longitude: -90.2026,
    event_date: '2026-10-21',
    start_time: '16:00',
    description: 'Pre-concert drinks and tour merchandise swap across from Enterprise Center before the newly added St. Louis show.',
    organizer_name: 'Gateway Rush Legion',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'cincinnati-01',
    name: 'Cincinnati Banks Pub Crawl',
    tour_city: 'Cincinnati',
    venue_name: 'The Banks Entertainment District',
    venue_url: 'https://thebankscincy.com',
    address: '100 Joe Nuxhall Way, Cincinnati, OH 45202',
    latitude: 39.0975,
    longitude: -84.509,
    event_date: '2026-10-23',
    start_time: '16:30',
    description: 'The Plan at a Glance: 4:30–5:30 PM Pre-Crawl Fuel & Drinks at The Filson Queen City Kitchen & Bar | 5:30–6:15 PM Classic Tavern Pours at The Blind Pig | 6:15–7:00 PM European Brews & Snacks at Taste of Belgium - The Banks | 7:00–7:30 PM Arena Entry at Heritage Bank Center | 7:30–10:45 PM Rush Live in Concert | 11:00 PM–Late Post-Show Party & Nightcap at Tin Roof',
    organizer_name: 'Ohio Valley Rush Fanatics',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 0
  },
  {
    id: 'pittsburgh-01',
    name: '[Example] Steel City Working Men Meetup (New Tour Date)',
    tour_city: 'Pittsburgh',
    venue_name: 'Souper Bowl Bar & Grill (Across from PPG Paints Arena)',
    venue_url: 'https://www.ppgpaintsarena.com',
    address: '910 5th Ave, Pittsburgh, PA 15219',
    latitude: 40.4395,
    longitude: -79.9893,
    event_date: '2026-11-15',
    start_time: '16:00',
    description: 'Pre-show gathering for the newly announced November Pittsburgh date. Working Man specials and live Rush concert videos.',
    organizer_name: 'Pittsburgh Rush Coalition',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'la-01',
    name: '[Example] Southern California Signals Tailgate',
    tour_city: 'Los Angeles',
    venue_name: 'Kia Forum Parking Lot E',
    venue_url: 'https://thekiaforum.com',
    address: '3900 W Manchester Blvd, Inglewood, CA 90305',
    latitude: 33.9583,
    longitude: -118.3419,
    event_date: '2026-06-07',
    start_time: '14:00',
    description: 'Tour kickoff celebration outside the Forum. California sunshine, taco trucks, and hundreds of Rush fans.',
    organizer_name: 'SoCal Rush Family',
    rsvp_link: null,
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'boston-01',
    name: '[Example] Causeway Street Fan Crawl',
    tour_city: 'Boston',
    venue_name: 'The Fours Bar & Hub on Causeway',
    venue_url: 'https://thehuboncauseway.com',
    address: '52 Causeway St, Boston, MA 02114',
    latitude: 42.3662,
    longitude: -71.0621,
    event_date: '2026-09-18',
    start_time: '16:00',
    description: 'Pre-show gathering right next to TD Garden. Classic rock jukebox takeover and commemorative tour badges.',
    organizer_name: 'New England Rush Syndicate',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  }
];
