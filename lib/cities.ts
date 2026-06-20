// Curated major job-market cities for location autocomplete in the CV
// builder. Deliberately a static list rather than a geocoding API - no key
// to manage, no rate limit, instant suggestions, and "major metro" is all
// the precision job matching actually needs (lib/matching.ts tokenizes
// location strings, it doesn't geocode them).
export const CITIES: string[] = [
  // United States
  "San Francisco, CA, USA", "New York, NY, USA", "Los Angeles, CA, USA", "Seattle, WA, USA",
  "Austin, TX, USA", "Chicago, IL, USA", "Boston, MA, USA", "Denver, CO, USA", "Atlanta, GA, USA",
  "Miami, FL, USA", "Dallas, TX, USA", "Houston, TX, USA", "Washington, DC, USA", "Philadelphia, PA, USA",
  "San Diego, CA, USA", "Portland, OR, USA", "Phoenix, AZ, USA", "Minneapolis, MN, USA", "Detroit, MI, USA",
  "Nashville, TN, USA", "Raleigh, NC, USA", "Charlotte, NC, USA", "Salt Lake City, UT, USA", "Las Vegas, NV, USA",
  "San Jose, CA, USA", "Pittsburgh, PA, USA",

  // Canada
  "Toronto, ON, Canada", "Vancouver, BC, Canada", "Montreal, QC, Canada", "Ottawa, ON, Canada", "Calgary, AB, Canada",

  // United Kingdom & Ireland
  "London, UK", "Manchester, UK", "Edinburgh, UK", "Birmingham, UK", "Bristol, UK", "Leeds, UK", "Dublin, Ireland",

  // Western Europe
  "Berlin, Germany", "Munich, Germany", "Frankfurt, Germany", "Hamburg, Germany", "Cologne, Germany",
  "Paris, France", "Lyon, France", "Amsterdam, Netherlands", "Rotterdam, Netherlands", "The Hague, Netherlands",
  "Madrid, Spain", "Barcelona, Spain", "Milan, Italy", "Rome, Italy", "Zurich, Switzerland", "Geneva, Switzerland",
  "Lisbon, Portugal", "Brussels, Belgium",

  // Nordics
  "Stockholm, Sweden", "Oslo, Norway", "Copenhagen, Denmark", "Helsinki, Finland",

  // Eastern Europe
  "Warsaw, Poland", "Krakow, Poland", "Prague, Czech Republic", "Budapest, Hungary",

  // India
  "Bengaluru, India", "Mumbai, India", "Delhi, India", "Hyderabad, India", "Pune, India", "Chennai, India",
  "Gurgaon, India", "Noida, India", "Kolkata, India", "Ahmedabad, India",

  // East & Southeast Asia
  "Singapore", "Hong Kong", "Tokyo, Japan", "Osaka, Japan", "Seoul, South Korea", "Shanghai, China",
  "Beijing, China", "Shenzhen, China", "Manila, Philippines", "Jakarta, Indonesia", "Ho Chi Minh City, Vietnam",
  "Bangkok, Thailand", "Kuala Lumpur, Malaysia",

  // Australia & New Zealand
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Canberra, Australia",
  "Auckland, New Zealand", "Wellington, New Zealand",

  // Middle East & Africa
  "Dubai, UAE", "Abu Dhabi, UAE", "Tel Aviv, Israel", "Cairo, Egypt", "Lagos, Nigeria", "Nairobi, Kenya",
  "Cape Town, South Africa", "Johannesburg, South Africa",

  // Latin America
  "Sao Paulo, Brazil", "Rio de Janeiro, Brazil", "Mexico City, Mexico", "Buenos Aires, Argentina",
  "Bogota, Colombia", "Santiago, Chile",

  // Other
  "Istanbul, Turkey", "Moscow, Russia",
];

const REMOTE_OPTIONS = ["Anywhere", "Remote"];

/**
 * Matches against the start of any comma-separated part of a city ("san" ->
 * "San Francisco, CA, USA" and "usa" -> same), case-insensitive. Capped to
 * keep the dropdown short.
 */
export function searchLocations(query: string, opts: { includeRemote?: boolean; limit?: number } = {}): string[] {
  const limit = opts.limit ?? 8;
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const pool = opts.includeRemote ? [...REMOTE_OPTIONS, ...CITIES] : CITIES;
  const matches = pool.filter((entry) =>
    entry
      .toLowerCase()
      .split(",")
      .some((part) => part.trim().startsWith(q))
  );
  return matches.slice(0, limit);
}
