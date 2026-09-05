import React, { useState, useEffect } from 'react';
import { Meetup, DEFAULT_MEETUPS, fetchTourParties, submitTourParty } from '../services/partiesService';

interface TourMeetupsViewProps {
  onAskFan?: (initialPrompt?: string) => void;
  onBack?: () => void;
}

const CITIES = [
  'All Cities',
  'Cincinnati',
  'Houston',
  'St. Louis',
  'Pittsburgh',
  'Toronto',
  'Chicago',
  'New York',
  'Cleveland',
  'Boston',
  'Los Angeles',
];

const TourMeetupsView: React.FC<TourMeetupsViewProps> = ({ onAskFan, onBack }) => {
  // Pre-initialize with verified defaults so it never renders blank
  const [parties, setParties] = useState<Meetup[]>(DEFAULT_MEETUPS);
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal for submitting a new meetup
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tour_city: 'Cincinnati',
    venue_name: '',
    address: '',
    event_date: '2026-10-23',
    start_time: '16:00',
    description: '',
    organizer_name: '',
    rsvp_link: '',
    category: 'tailgate' as const,
  });

  const loadParties = async (city?: string) => {
    try {
      const cityQuery = city && city !== 'All Cities' ? city : undefined;
      const data = await fetchTourParties({ city: cityQuery });
      if (data?.parties && data.parties.length > 0) {
        setParties(data.parties);
      }
      if (data.detectedLocation?.city) {
        setDetectedLocation(data.detectedLocation.city);
      }
    } catch (err: any) {
      console.warn('Using preloaded defaults:', err);
    }
  };

  useEffect(() => {
    loadParties(selectedCity);
  }, [selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city === 'All Cities') {
      setParties(DEFAULT_MEETUPS);
    } else {
      setParties(DEFAULT_MEETUPS.filter(p => p.tour_city.toLowerCase() === city.toLowerCase()));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.venue_name) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);
    try {
      const res = await submitTourParty(formData);
      setSubmitSuccess(res.message || 'Meetup submitted!');
      setIsSubmitModalOpen(false);
      // Only prepend to visible list if the meetup was approved (not pending review)
      if (res.meetup && res.meetup.status === 'approved') {
        setParties(prev => [res.meetup, ...prev]);
      }
      // Reset form
      setFormData({
        name: '',
        tour_city: 'Cincinnati',
        venue_name: '',
        address: '',
        event_date: '2026-10-23',
        start_time: '16:00',
        description: '',
        organizer_name: '',
        rsvp_link: '',
        category: 'tailgate',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to submit meetup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-95 p-5 md:p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm text-white">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-bold transition shadow cursor-pointer"
          >
            ← Back to Rock Trivia
          </button>
        )}

        {onAskFan && (
          <button
            onClick={() => onAskFan("What fan parties or tailgates are happening for the 2026 tour?")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition shadow cursor-pointer"
          >
            💬 Ask Synthetic Rush Fan →
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold mb-2">
            📍 2026 FIFTY SOMETHING TOUR
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide">Tour Gatherings & Meetups</h2>
          <p className="text-sm text-gray-300 mt-1">
            Pre-show tailgates, pub crawls & tribute band gigs organized by fellow fans.
          </p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider transition transform hover:scale-105 shadow-lg shadow-amber-900/40 cursor-pointer"
        >
          + Post a Gathering
        </button>
      </div>

      {/* Fan Directions / Instructions Card */}
      <div className="mb-6 p-4 rounded-xl bg-gray-950/80 border border-amber-500/30 text-xs text-gray-300 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <h3 className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
            <span>🧭</span> Directions: How Tour Meetups & AI Concierge Work
          </h3>
          <span className="text-[11px] text-gray-400 bg-gray-900 px-2.5 py-0.5 rounded-full border border-gray-800">No login required to view</span>
        </div>
        <p className="leading-relaxed">
          Welcome to the fan meetup hub for the <strong>2026 Fifty Something Tour</strong>! Here fans can find or organize pre-show tailgates, meetups, and tribute band concerts across all confirmed tour cities.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800">
            <strong className="text-amber-300 block mb-1">1. Pick Your Tour City</strong>
            Click any city button below to see tailgates, pub crawls, and venue locations.
          </div>
          <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800">
            <strong className="text-purple-300 block mb-1">2. Ask the Tour Concierge</strong>
            Click <strong className="text-purple-200">"Ask Synthetic Fan"</strong> anytime to get instant AI answers on parking, venues, and local advice—no origin story required.
          </div>
          <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800">
            <strong className="text-green-300 block mb-1">3. Host a Meetup?</strong>
            Click <strong className="text-green-200">"+ Post a Gathering"</strong> above to submit your tailgate or pub gathering to the directory.
          </div>
        </div>
      </div>

      {/* Success banner */}
      {submitSuccess && (
        <div className="mb-6 p-3 rounded-xl bg-green-900/50 border border-green-500/50 text-green-300 text-sm flex justify-between items-center">
          <span>✅ {submitSuccess}</span>
          <button onClick={() => setSubmitSuccess(null)} className="text-green-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* City Filters */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Your Tour City:</label>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCityChange(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCity === city
                  ? 'bg-amber-600 text-black shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Detected Location Info */}
      {detectedLocation && selectedCity === 'All Cities' && (
        <div className="mb-6 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-center justify-between">
          <span>📍 Detected location: <strong>{detectedLocation}</strong>. Showing nearest tour events first.</span>
        </div>
      )}

      {/* Meetup Cards List */}
      <div className="space-y-4">
        {parties.length === 0 ? (
          <div className="py-12 text-center bg-gray-950/50 rounded-xl border border-gray-800 p-6">
            <p className="text-gray-300 font-semibold mb-2">No meetups listed yet for {selectedCity}.</p>
            <p className="text-xs text-gray-500 mb-4">Are you attending this tour stop? Be the first to organize a tailgate!</p>
            <button
              onClick={() => {
                if (selectedCity !== 'All Cities') setFormData(prev => ({ ...prev, tour_city: selectedCity }));
                setIsSubmitModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-full cursor-pointer"
            >
              Post the First Meetup
            </button>
          </div>
        ) : (
          parties.map((party) => (
            <div
              key={party.id}
              className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 hover:border-amber-500/50 transition-all duration-200 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600/30 border border-red-500/50 text-red-300">
                      {party.tour_city}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-gray-300">
                      {party.category?.replace('_', ' ')}
                    </span>
                    {party.distance_miles !== undefined && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        • {party.distance_miles} miles away
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{party.name}</h3>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <div className="text-amber-400 font-bold">📅 {party.event_date}</div>
                  {party.start_time && <div className="text-gray-400 font-medium">⏰ {party.start_time}</div>}
                </div>
              </div>

              {/* Venue & Location */}
              <div className="text-xs text-gray-300 mb-3 flex items-start gap-1.5">
                <span className="text-amber-400">📍</span>
                <span>
                  <strong>{party.venue_name}</strong>
                  {party.address ? ` — ${party.address}` : ''}
                </span>
              </div>

              {/* Description */}
              {party.description && (
                <p className="text-xs text-gray-300 mb-4 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  {party.description}
                </p>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800 text-xs">
                <div className="text-gray-400 text-[11px]">
                  Organized by: <strong className="text-gray-200">{party.organizer_name || 'Rush Fan'}</strong>
                </div>
                <div className="flex items-center gap-2">
                  {onAskFan && (
                    <button
                      onClick={() =>
                        onAskFan(
                          `Tell me more about the "${party.name}" at ${party.venue_name} in ${party.tour_city} on ${party.event_date}. What should fans know?`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 text-xs font-semibold transition cursor-pointer"
                      title="Ask the Synthetic Rush Fan about this event"
                    >
                      💬 Ask Synthetic Fan
                    </button>
                  )}
                  {party.rsvp_link && (
                    <a
                      href={party.rsvp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs transition cursor-pointer"
                    >
                      RSVP / Info →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Quick Navigation & Call-to-Action */}
      <div className="mt-8 p-4 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <div className="text-xs text-gray-400">Have questions about tour dates, venues, or local gatherings?</div>
          <div className="text-sm font-bold text-white">Ask the Synthetic Rush Fan Concierge</div>
        </div>
        <div className="flex items-center gap-2">
          {onAskFan && (
            <button
              onClick={() => onAskFan("What fan parties or tailgates are happening for the 2026 tour?")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              💬 Chat with Synthetic Fan
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              ⚡ Rock Trivia
            </button>
          )}
        </div>
      </div>

      {/* SUBMIT MEETUP MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white">Post a Rush Tour Gathering</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Star Tailgate Party"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Tour City *</label>
                  <select
                    value={formData.tour_city}
                    onChange={(e) => setFormData({ ...formData, tour_city: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    {CITIES.filter((c) => c !== 'All Cities').map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="tailgate">Pre-Show Tailgate</option>
                    <option value="pub_crawl">Pub Crawl / Bar</option>
                    <option value="tribute_band">Tribute Band Gig</option>
                    <option value="listening_party">Listening Party</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United Center Lot C / Heritage Bank Plaza"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Address / Meeting Spot</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Joe Nuxhall Way, Cincinnati, OH"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Description & Meetup Details</label>
                <textarea
                  rows={3}
                  placeholder="Share details: food, drinks, flags to look for, what fans should bring..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Organizer / Host</label>
                  <input
                    type="text"
                    placeholder="Your name or fan club"
                    value={formData.organizer_name}
                    onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">RSVP / Group Link</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={formData.rsvp_link}
                    onChange={(e) => setFormData({ ...formData, rsvp_link: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold shadow-lg transition cursor-pointer"
                >
                  {isSubmitting ? 'Posting...' : 'Publish Meetup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourMeetupsView;
