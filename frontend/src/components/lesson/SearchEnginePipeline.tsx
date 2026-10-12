import { useState, useEffect, useRef } from 'react';
import type { SearchEnginePipelineConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes nn-pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes nn-slide { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes nn-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
.nn-slide { animation: nn-slide 0.5s ease-out forwards; }
.nn-pop { animation: nn-pop 0.4s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: SearchEnginePipelineConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

interface SearchResult {
  title: string;
  snippet: string;
  details: string[];
}

interface SearchQuery {
  query: string;
  tokens: string[];
  keywords: string[];
  stopWords: string[];
  intent: string;
  results: SearchResult[];
}

const SEARCH_QUERIES: SearchQuery[] = [
  {
    query: 'Best cafes near my college',
    tokens: ['Best', 'cafes', 'near', 'my', 'college'],
    keywords: ['cafes', 'college'],
    stopWords: ['Best', 'near', 'my'],
    intent: 'Find nearby cafes',
    results: [
      { title: 'Campus Cafes Near You', snippet: 'Student-reviewed cafes within walking distance of your college campus.', details: ['Based on 128 reviews', 'Average rating: 4.2 stars', 'Open now until 10 PM'] },
      { title: 'Top Rated Local Cafes', snippet: 'Discover the highest-rated cafes in your college area with student discounts.', details: ['Distance: 0.5 km', 'Rating: 4.5 stars', 'Student ID discount available'] },
      { title: 'Student Coffee Spots', snippet: 'Popular hangout places for students with affordable menu options.', details: ['Offers: Buy 1 Get 1 Free', 'Free Wi-Fi', 'Quiet study area available'] },
    ],
  },
  {
    query: 'Weather tomorrow in Hyderabad',
    tokens: ['Weather', 'tomorrow', 'in', 'Hyderabad'],
    keywords: ['Weather', 'Hyderabad'],
    stopWords: ['tomorrow', 'in'],
    intent: 'Weather Forecast',
    results: [
      { title: 'Hyderabad Weather Tomorrow', snippet: 'Partly cloudy with a high of 32C and low of 24C. Chance of rain: 15%.', details: ['Humidity: 65%', 'Wind: 12 km/h', 'UV Index: Moderate'] },
      { title: 'Hourly Forecast', snippet: 'Morning: 26C, Afternoon: 32C, Evening: 28C. Mostly clear skies throughout the day.', details: ['Sunrise: 6:12 AM', 'Sunset: 6:45 PM', 'Air quality: Good'] },
      { title: 'Weather Alerts', snippet: 'No severe weather warnings for Hyderabad tomorrow.', details: ['Last updated: 1 hour ago', 'Next update: 6 PM', 'Alert level: Green'] },
    ],
  },
  {
    query: 'Machine Learning tutorials',
    tokens: ['Machine', 'Learning', 'tutorials'],
    keywords: ['Machine', 'Learning', 'tutorials'],
    stopWords: [],
    intent: 'Learning Resources',
    results: [
      { title: 'Introduction to Machine Learning', snippet: 'A beginner-friendly course covering supervised and unsupervised learning.', details: ['Free course', 'Duration: 6 weeks', 'Certificate available'] },
      { title: 'ML Tutorials for Students', snippet: 'Step-by-step tutorials with Python code examples and real datasets.', details: ['Projects included', 'Beginner to advanced', 'Jupyter notebooks provided'] },
      { title: 'Best Online ML Resources', snippet: 'Curated list of the best courses, books, and video tutorials for Machine Learning.', details: ['Courses from top universities', 'Hands-on exercises', 'Community forum access'] },
    ],
  },
  {
    query: 'Top tourist places in Japan',
    tokens: ['Top', 'tourist', 'places', 'in', 'Japan'],
    keywords: ['tourist', 'places', 'Japan'],
    stopWords: ['Top', 'in'],
    intent: 'Travel Recommendations',
    results: [
      { title: 'Must Visit Places in Japan', snippet: 'Explore Tokyo, Kyoto, and Osaka. Discover temples, markets, and cultural landmarks.', details: ['Tokyo: 15 attractions', 'Kyoto: 12 temples', 'Osaka: 8 landmarks'] },
      { title: 'Japan Travel Guide', snippet: 'Plan your trip with tips on culture, food, accommodation, and transportation.', details: ['Best season: Spring', 'Budget: $100/day', 'Visa required'] },
      { title: 'Popular Tourist Destinations', snippet: 'Top-rated destinations with reviews, ratings, and travel tips from visitors.', details: ['Rating: 4.7 stars', 'Over 5000 reviews', 'Suggested itinerary: 7 days'] },
    ],
  },
  {
    query: 'How to grow tomato plants',
    tokens: ['How', 'to', 'grow', 'tomato', 'plants'],
    keywords: ['grow', 'tomato', 'plants'],
    stopWords: ['How', 'to'],
    intent: 'Gardening Guide',
    results: [
      { title: 'Tomato Growing Guide', snippet: 'Complete guide from seed to harvest. Learn about soil, watering, and sunlight requirements.', details: ['Soil: Well-drained', 'Water: Daily', 'Sunlight: 6-8 hours'] },
      { title: 'Beginner Guide to Tomatoes', snippet: 'Common mistakes to avoid and tips for a successful tomato harvest.', details: ['Step-by-step instructions', 'Troubleshooting guide', 'Harvest in 60-80 days'] },
      { title: 'Best Tomato Varieties', snippet: 'Choose the right variety based on your climate, season, and expected yield.', details: ['Cherry tomatoes: Easy', 'Roma: Best for sauce', 'Climate: Warm season'] },
    ],
  },
];

const PIPELINE_STEPS = [
  'Tokenization',
  'Keyword Extraction',
  'Intent Detection',
  'Search Results',
];

export default function SearchEnginePipeline({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<'carousel' | 'build' | 'complete'>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedQuery, setSelectedQuery] = useState<SearchQuery | null>(null);
  const [stage, setStage] = useState(0);
  const [tokenAnimated, setTokenAnimated] = useState(false);
  const [intentProcessing, setIntentProcessing] = useState(false);
  const [intentDone, setIntentDone] = useState(false);
  const [showBow, setShowBow] = useState(false);
  const intentTimer = useRef<number | null>(null);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  useEffect(() => {
    return () => {
      if (intentTimer.current) clearTimeout(intentTimer.current);
    };
  }, []);

  const handleSlideNext = () => {
    if (isLastSlide) setPhase('build');
    else setSlideIdx(i => i + 1);
  };

  const handleSelectQuery = (q: SearchQuery) => {
    onAttempt?.();
    setSelectedQuery(q);
    setStage(0);
    setTokenAnimated(false);
    setIntentProcessing(false);
    setIntentDone(false);
    setShowBow(false);
    setTimeout(() => setTokenAnimated(true), 400);
  };

  const handleContinueToKeywords = () => {
    setStage(1);
  };

  const handleContinueToIntent = () => {
    setStage(2);
    setIntentProcessing(true);
    intentTimer.current = window.setTimeout(() => {
      setIntentProcessing(false);
      setIntentDone(true);
    }, 1500);
  };

  const handleContinueToResults = () => {
    setStage(3);
  };

  const handleComplete = () => {
    if (intentTimer.current) clearTimeout(intentTimer.current);
    onComplete();
  };

  const handleTryAgain = () => {
    if (intentTimer.current) clearTimeout(intentTimer.current);
    intentTimer.current = null;
    setPhase('carousel');
    setSlideIdx(0);
    setSelectedQuery(null);
    setStage(0);
    setTokenAnimated(false);
    setIntentProcessing(false);
    setIntentDone(false);
    setShowBow(false);
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    const slideSvgs = [
      <svg key="s1" className="w-16 h-16 mx-auto mb-4 text-blue-400" viewBox="0 0 80 80" fill="none">
        <rect x="8" y="12" width="64" height="20" rx="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="26" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.9">Search Query</text>
        <path d="M40 32 L40 48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
        <rect x="12" y="48" width="18" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="32" y="48" width="18" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="52" y="48" width="18" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <text x="21" y="57" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.85">Token</text>
        <text x="41" y="57" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.85">Token</text>
        <text x="61" y="57" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.85">Token</text>
      </svg>,
      <svg key="s2" className="w-16 h-16 mx-auto mb-4 text-blue-400" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="16" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="19" textAnchor="middle" fontSize="7" fill="currentColor">1</text>
        <path d="M40 26 L40 34" stroke="currentColor" strokeWidth="1.5" />
        <rect x="28" y="34" width="24" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="43" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.9">Tokenize</text>
        <path d="M40 48 L40 54" stroke="currentColor" strokeWidth="1.5" />
        <rect x="28" y="54" width="24" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="63" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.9">Keywords</text>
      </svg>,
      <svg key="s3" className="w-16 h-16 mx-auto mb-4 text-emerald-400" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" fill="currentColor" fillOpacity="0.12" />
        <circle cx="40" cy="40" r="14" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <circle cx="40" cy="40" r="5" fill="currentColor" fillOpacity="0.5" />
        <path d="M40 14 L40 18 M40 62 L40 66 M14 40 L18 40 M62 40 L66 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>,
    ];
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Inside a Search Engine</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : i < slideIdx ? 'bg-blue-500/70' : 'bg-slate-500/60'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-8 pt-6 pb-8">
          <div className="mx-auto text-center max-w-lg">
            <div className="nn-pop">{slideSvgs[slideIdx] || slideSvgs[0]}</div>
            <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
            <p className="mt-3 text-base text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
            <div className="mt-8">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-base font-semibold text-white px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                {isLastSlide ? 'Start Exploring' : 'Next'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Build ──
  if (phase === 'build') {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Inside a Search Engine</p>
          </div>
          {selectedQuery && (
            <div className="flex items-center gap-2">
              {PIPELINE_STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                    i < stage ? 'bg-emerald-400' : i === stage ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : 'bg-slate-500/60'
                  }`} />
                  <span className={`text-xs transition-colors whitespace-nowrap ${
                    i <= stage ? 'text-slate-200' : 'text-slate-300'
                  }`}>{label}</span>
                  {i < PIPELINE_STEPS.length - 1 && <div className="flex-1 h-px bg-slate-600/50" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* ── Search ── */}
          {!selectedQuery && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/40 w-full max-w-xl">
                  <svg className="w-5 h-5 text-slate-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span className="text-base text-slate-300">Select a query to explore</span>
                </div>
              </div>
              <div className="grid gap-2">
                {SEARCH_QUERIES.map(q => (
                  <button key={q.query} onClick={() => handleSelectQuery(q)}
                    className="text-left px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/40 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all"
                  >
                    <p className="text-sm text-slate-300">{q.query}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-blue-900/10 border border-blue-500/15 px-5 py-3">
                <p className="text-xs text-blue-300 leading-relaxed">
                  The lecture showed that computers cannot understand full sentences. They break them into tokens first — just like this search engine will do with your query.
                </p>
              </div>
            </div>
          )}

          {/* ── Pipeline ── */}
          {selectedQuery && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Mini search bar */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/40">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <span className="text-base text-slate-200">{selectedQuery.query}</span>
              </div>

              {/* Stage 0: Tokenization */}
              {stage >= 0 && (
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-6 py-5 nn-slide">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <span className="text-[10px] text-blue-300 font-bold">1</span>
                    </div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-medium">Tokenization</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedQuery.tokens.map((token, i) => (
                      <span key={i}
                        className={`px-3 py-1.5 rounded-lg text-base font-medium text-slate-200 bg-slate-800 border border-slate-700 transition-all duration-500 ${
                          tokenAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}
                        style={{ transitionDelay: `${i * 120}ms` }}
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                  {tokenAnimated && (
                    <p className="text-xs text-slate-300 mt-3">The sentence was divided into individual tokens.</p>
                  )}
                  {tokenAnimated && stage === 0 && (
                    <div className="mt-4 flex justify-center">
                      <button onClick={handleContinueToKeywords}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                        Continue
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stage 1: Keyword Extraction */}
              {stage >= 1 && (
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-6 py-5 nn-slide">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center">
                      <span className="text-[10px] text-amber-300 font-bold">2</span>
                    </div>
                    <p className="text-xs text-amber-200 uppercase tracking-wider font-medium">Keyword Extraction</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedQuery.tokens.map((token, i) => {
                      const isKeyword = selectedQuery.keywords.includes(token);
                      return (
                        <span key={i}
                          className={`px-3 py-1.5 rounded-lg text-base font-medium transition-all duration-500 ${
                            isKeyword
                              ? 'bg-emerald-900/30 border border-emerald-500/50 text-emerald-300 scale-110'
                              : 'bg-slate-800/40 border border-slate-700/30 text-slate-300 opacity-70'
                          }`}
                        >
                          {token}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500/50" />
                      <span className="text-[11px] text-slate-300">Keyword</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-slate-700/50" />
                      <span className="text-[11px] text-slate-300">Less important</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-3">The search engine focuses on the most meaningful words.</p>
                  {stage === 1 && (
                    <div className="mt-4 flex justify-center">
                      <button onClick={handleContinueToIntent}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                        Continue
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stage 2: Intent Detection */}
              {stage >= 2 && (
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-6 py-5 nn-slide">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <span className="text-[10px] text-purple-300 font-bold">3</span>
                    </div>
                    <p className="text-xs text-purple-200 uppercase tracking-wider font-medium">Intent Detection</p>
                  </div>
                  {intentProcessing && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-4 h-4 rounded-full bg-purple-400" style={{ animation: 'nn-pulse 0.8s ease-in-out infinite' }} />
                      <p className="text-sm text-purple-200 font-medium">Understanding your request...</p>
                    </div>
                  )}
                  {intentDone && (
                    <div className="nn-pop">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <p className="text-base font-semibold text-purple-200">Intent Detected</p>
                      </div>
                      <div className="mt-2 px-4 py-2.5 rounded-lg bg-purple-900/35 border border-purple-500/40">
                        <p className="text-lg font-bold text-purple-100">{selectedQuery.intent}</p>
                      </div>
                      <p className="text-xs text-slate-200 mt-3">The search engine identified what you are trying to achieve.</p>
                      {stage === 2 && (
                        <div className="mt-4 flex justify-center">
                          <button onClick={handleContinueToResults}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                            Continue
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stage 3: Search Results + Lecture Connection */}
              {stage >= 3 && (
                <div className="space-y-4 nn-slide">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                      <span className="text-[10px] text-emerald-300 font-bold">4</span>
                    </div>
                    <p className="text-xs text-emerald-200 uppercase tracking-wider font-medium">Search Results</p>
                  </div>
                  {selectedQuery.results.map((result, i) => (
                    <div key={i} className="rounded-xl bg-slate-900/90 border border-slate-600/50 px-5 py-4 nn-slide"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <p className="text-sm font-semibold text-blue-200 mb-1">{result.title}</p>
                      <p className="text-sm text-slate-200 leading-relaxed">{result.snippet}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {result.details.map((d, j) => (
                          <span key={j} className="text-[11px] text-slate-200 bg-slate-700/60 px-2 py-0.5 rounded">{d}</span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Lecture Connection */}
                  <div className="rounded-xl bg-blue-900/25 border border-blue-500/40 px-5 py-4 nn-slide">
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-medium mb-2">Connecting to the lecture</p>
                    <div className="space-y-2 text-sm text-blue-100 leading-relaxed">
                      <p>This is exactly what the lecture described: computers cannot understand full sentences. They must first <span className="text-blue-200 font-medium">tokenize</span> the text, then <span className="text-blue-200 font-medium">extract keywords</span>, and <span className="text-blue-200 font-medium">identify intent</span> before searching.</p>
                      <p>The same pipeline powers every search engine, chatbot, and voice assistant — from tokenization all the way to understanding your intent, just like the NLP concepts covered in the lecture.</p>
                    </div>
                  </div>

                  {/* Bag of Words */}
                  <div className="flex justify-center">
                    {!showBow && (
                      <button onClick={() => { setShowBow(true); onAttempt?.(); }}
                        className="text-xs font-medium text-slate-300 px-4 py-2 rounded-lg border border-slate-700/40 hover:border-blue-500/30 hover:text-blue-200 transition-all"
                      >
                        View Word Frequency
                      </button>
                    )}
                  </div>

                  {showBow && (
                    <div className="rounded-xl bg-slate-900/90 border border-blue-500/40 px-6 py-5 nn-slide">
                      <p className="text-xs text-blue-200 uppercase tracking-wider font-medium mb-3">Bag of Words — Word Frequencies</p>
                      <div className="space-y-2">
                        {(() => {
                          const freq = new Map<string, number>();
                          for (const t of selectedQuery.tokens) {
                            const lower = t.toLowerCase();
                            freq.set(lower, (freq.get(lower) || 0) + 1);
                          }
                          const entries = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
                          return entries.map(([word, count]) => (
                            <div key={word} className="flex items-center gap-3">
                              <span className="text-sm font-mono text-slate-300 w-24 text-right">{word}</span>
                              <div className="flex-1 h-6 rounded-md bg-slate-800 overflow-hidden">
                                <div className="h-full rounded-md bg-gradient-to-r from-blue-600/80 to-indigo-600/60 transition-all duration-700"
                                  style={{ width: `${(count / Math.max(...entries.map(e => e[1]))) * 100}%` }} />
                              </div>
                              <span className="text-base font-bold text-blue-200 w-6 text-right tabular-nums">{count}</span>
                            </div>
                          ));
                        })()}
                      </div>
                      <p className="text-xs text-slate-300 mt-3">Bag of Words simply counts how often each word appears. It does not understand grammar or word order.</p>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <button onClick={handleComplete}
                      className="inline-flex items-center gap-2 text-base font-semibold text-white px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">
                      Complete Exploration
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20" />
      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">{config.completionTitle}</h3>
          <p className="text-base text-slate-300 max-w-lg mx-auto">{config.completionMessage}</p>
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          {config.takeaways.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 text-base text-slate-300">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {t}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 pt-3">
          <button onClick={handleTryAgain} className="px-5 py-2.5 text-sm font-semibold text-slate-300 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
            Try Again
          </button>
          <button onClick={onComplete} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
