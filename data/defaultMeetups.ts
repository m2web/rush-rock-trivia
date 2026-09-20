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
    id: 'sanantonio-01',
    name: '[Example] Alamo City Pre-Show Fiesta',
    tour_city: 'San Antonio',
    venue_name: 'Frost Bank Center',
    venue_url: 'https://www.frostbankcenter.com',
    address: '1 AT&T Center Pkwy, San Antonio, TX 78219',
    latitude: 29.4270,
    longitude: -98.4375,
    event_date: '2026-09-23',
    start_time: '16:00',
    description: 'Tex-Mex tailgate and Rush fan gathering in the Frost Bank Center plaza. Brisket tacos, cold Lone Stars, and a Rush playlist blasting all afternoon.',
    organizer_name: 'Alamo City Rush Crew',
    rsvp_link: null,
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'houston-01',
    name: '[Example] Space City Rush Tailgate (New Tour Date)',
    tour_city: 'Houston',
    venue_name: 'Toyota Center',
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
    id: 'denver-01',
    name: '[Example] Mile High Rush Rally',
    tour_city: 'Denver',
    venue_name: 'Ball Arena',
    venue_url: 'https://www.ballarena.com',
    address: '1000 Chopper Cir, Denver, CO 80204',
    latitude: 39.7487,
    longitude: -105.0077,
    event_date: '2026-10-05',
    start_time: '15:30',
    description: 'Rocky Mountain pre-show rally outside Ball Arena. Colorado craft brews, mountain air, and a parking lot full of Rush fans.',
    organizer_name: 'Mile High Rush Collective',
    rsvp_link: null,
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'seattle-01',
    name: '[Example] Emerald City Fan Gathering',
    tour_city: 'Seattle',
    venue_name: 'Climate Pledge Arena',
    venue_url: 'https://www.climatepledgearena.com',
    address: '334 1st Ave N, Seattle, WA 98109',
    latitude: 47.6222,
    longitude: -122.3540,
    event_date: '2026-10-10',
    start_time: '16:00',
    description: 'Pacific Northwest fan meetup at the Seattle Center before the show. Artisan coffee, local IPAs, and Rush deep cuts on the speakers.',
    organizer_name: 'PNW Rush Alliance',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'sanjose-01',
    name: '[Example] Silicon Valley Signals Meetup',
    tour_city: 'San Jose',
    venue_name: 'SAP Center',
    venue_url: 'https://www.sapcenter.com',
    address: '525 W Santa Clara St, San Jose, CA 95113',
    latitude: 37.3327,
    longitude: -121.9010,
    event_date: '2026-10-15',
    start_time: '16:00',
    description: 'Bay Area Rush fans converge on SAP Center for a pre-show gathering. Tech meets prog rock — craft cocktails and concert countdown.',
    organizer_name: 'Bay Area Rush Network',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'stlouis-01',
    name: '[Example] Gateway Arch Fan Gathering',
    tour_city: 'St. Louis',
    venue_name: 'Enterprise Center',
    venue_url: 'https://www.enterprisecenter.com',
    address: '1401 Clark Ave, St. Louis, MO 63103',
    latitude: 38.6268,
    longitude: -90.2026,
    event_date: '2026-10-21',
    start_time: '16:00',
    description: 'Pre-concert drinks and tour merchandise swap across from Enterprise Center before the St. Louis show.',
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
    description: 'The pub crawl will take place at the Banks before AND after the 7:30 PM Rush Fifty Something tour show at Heritage Bank Center.',
    organizer_name: 'Mark McFadden',
    rsvp_link: 'https://thebankscincy.com/',
    category: 'pub_crawl',
    status: 'approved',
    is_example: 0
  },
  {
    id: 'dc-01',
    name: '[Example] Capital City Rush Meetup',
    tour_city: 'Washington',
    venue_name: 'Capital One Arena',
    venue_url: 'https://www.capitalonearena.com',
    address: '601 F St NW, Washington, DC 20004',
    latitude: 38.8982,
    longitude: -77.0209,
    event_date: '2026-10-25',
    start_time: '16:00',
    description: 'Downtown DC fan gathering steps from Capital One Arena. Penn Quarter pubs, Rush trivia, and pre-show camaraderie in the capital.',
    organizer_name: 'DC Rush Faithful',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'uncasville-01',
    name: '[Example] Mohegan Sun Pre-Show Mixer',
    tour_city: 'Uncasville',
    venue_name: 'Mohegan Sun Arena',
    venue_url: 'https://mohegansun.com',
    address: '1 Mohegan Sun Blvd, Uncasville, CT 06382',
    latitude: 41.4930,
    longitude: -72.0867,
    event_date: '2026-10-30',
    start_time: '16:00',
    description: 'Casino-resort pre-show gathering at Mohegan Sun. Dinner, drinks, and Rush fans from across New England before the arena show.',
    organizer_name: 'New England Rush Syndicate',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'hollywood-01',
    name: '[Example] South Florida Hard Rock Tailgate',
    tour_city: 'Hollywood',
    venue_name: 'Hard Rock Live',
    venue_url: 'https://www.seminolehardrockhollywood.com',
    address: '1 Seminole Way, Hollywood, FL 33314',
    latitude: 26.0513,
    longitude: -80.2107,
    event_date: '2026-11-05',
    start_time: '16:30',
    description: 'Tropical pre-show party at the Seminole Hard Rock complex. Pool-side Rush playlist, island cocktails, and fan meetup before showtime.',
    organizer_name: 'South Florida Rush Tribe',
    rsvp_link: null,
    category: 'tailgate',
    status: 'approved',
    is_example: 1
  },
  {
    id: 'tampa-01',
    name: '[Example] Tampa Bay Pre-Show Gathering',
    tour_city: 'Tampa',
    venue_name: 'Benchmark International Arena',
    venue_url: 'https://www.ameliearena.com',
    address: '401 Channelside Dr, Tampa, FL 33602',
    latitude: 27.9425,
    longitude: -82.4519,
    event_date: '2026-11-09',
    start_time: '16:00',
    description: 'Gulf Coast fan meetup in the Channelside District before the Tampa show. Waterfront drinks, Cuban sandwiches, and Rush all night.',
    organizer_name: 'Tampa Bay Rush Coalition',
    rsvp_link: null,
    category: 'pub_crawl',
    status: 'approved',
    is_example: 1
  }
];
