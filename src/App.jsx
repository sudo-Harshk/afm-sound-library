import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import SearchBar from './components/SearchBar';
import CategoryList from './components/CategoryList';
import LabelList from './components/LabelList';
import CategoryDetail from './components/CategoryDetail';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DataTable from './components/DataTable';
import Breadcrumb from './components/Breadcrumb';
import DetailPanel from './components/DetailPanel';
import { searchSounds } from './lib/refs';
import { useTheme } from './lib/useTheme';

const SECTION_ORDER = [
  'Human vocal and speech sounds',
  'Human respiratory and involuntary sounds',
  'Human digestive, body, and contact sounds',
  'Baby and infant sounds',
  'Animal sounds',
  'Liquid and fluid sounds',
  'Social and Crowd',
  'Nature and environmental sounds',
  'Impact and collision sounds',
  'Friction and texture sounds',
  'Metallic and resonant sounds',
  'Mechanical, appliance, and industrial sounds',
  'Air and Pressure sounds',
  'Electronic, alert, and interface sounds',
  'Music and tonal sounds',
  'Food Preparation - Cooking Sounds',
  'Transportation and Vehicle Sounds',
  'Construction and Tool Sounds',
  'Common confusable sound pairs',
  'Background, silence, and ambience labels',
  'Annotation guidelines and quality-control rules',
];

function getInitialQuery() {
  return new URLSearchParams(window.location.search).get('q') || '';
}

export default function App() {
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(getInitialQuery);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'sounds'),
      (snapshot) => {
        setSounds(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query) params.set('q', query);
    else params.delete('q');
    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [query]);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const s of sounds) {
      if (!s.section) continue;
      counts.set(s.section, (counts.get(s.section) || 0) + 1);
    }
    const ordered = SECTION_ORDER.filter((name) => counts.has(name)).map((name) => ({ name, count: counts.get(name) }));
    const extras = [...counts.keys()].filter((name) => !SECTION_ORDER.includes(name)).map((name) => ({ name, count: counts.get(name) }));
    return [...ordered, ...extras];
  }, [sounds]);

  const searchResults = useMemo(() => searchSounds(sounds, query), [sounds, query]);

  const categorySounds = useMemo(() => {
    if (!activeCategory) return [];
    return sounds
      .filter((s) => s.section === activeCategory)
      .sort((a, b) => (a.subcategory || '').localeCompare(b.subcategory || '') || a.canonicalLabel.localeCompare(b.canonicalLabel));
  }, [sounds, activeCategory]);

  const handleAddReference = useCallback(async (soundId, url) => {
    const soundRef = doc(db, 'sounds', soundId);
    await updateDoc(soundRef, {
      references: arrayUnion({ url, addedBy: 'user', addedAt: new Date().toISOString() }),
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="w-6 h-6 border-2 border-ink-faint border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Mobile layout */}
      <div className="lg:hidden">
        <header className="border-b border-line bg-paper-raised">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-accent text-[16px]">graphic_eq</span>
              </div>
              <span className="text-[14px] font-semibold text-ink tracking-tight truncate">AFM Sound Catalog</span>
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
              className="shrink-0 w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent/50 transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[16px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          <SearchBar query={query} onQueryChange={setQuery} />
          <div className="mt-6 sm:mt-8">
            {renderContent(isSearching, searchResults, activeCategory, categorySounds, categories, setActiveCategory, handleAddReference)}
          </div>
        </main>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex lg:flex-col lg:min-h-screen lg:ml-[240px]">
        <TopBar query={query} onQueryChange={setQuery} />
        <main className="flex-1 overflow-y-auto p-6">
            <Breadcrumb
              items={[
                { label: 'All Categories', onClick: () => setActiveCategory(null) },
                ...(activeCategory ? [{ label: activeCategory }] : []),
                ...(isSearching ? [{ label: `Search: ${query}` }] : []),
              ]}
            />
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] font-semibold text-ink leading-tight tracking-tight">
                  {isSearching
                    ? <>Search: &lsquo;{query}&rsquo;</>
                    : activeCategory
                      ? activeCategory
                      : 'Sound Catalog'}
                </h2>
                <p className="text-[14px] text-ink-soft mt-1">
                  {isSearching
                    ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`
                    : activeCategory
                      ? `${categorySounds.length} label${categorySounds.length !== 1 ? 's' : ''}`
                      : `${sounds.length} total labels across ${categories.length} categories`}
                </p>
              </div>
            </div>
            <DataTable
              sounds={isSearching ? searchResults : activeCategory ? categorySounds : sounds}
              onRowClick={(sound) => setSelectedSound(sound)}
            />
        </main>
      </div>

      {/* Detail panel */}
      {selectedSound && (
        <DetailPanel
          sound={selectedSound}
          onClose={() => setSelectedSound(null)}
          onAddReference={handleAddReference}
        />
      )}
    </div>
  );
}

function renderContent(isSearching, searchResults, activeCategory, categorySounds, categories, setActiveCategory, handleAddReference) {
  if (isSearching) {
    return <LabelList sounds={searchResults} onAddReference={handleAddReference} />;
  }
  if (activeCategory) {
    return (
      <CategoryDetail
        category={activeCategory}
        sounds={categorySounds}
        onBack={() => setActiveCategory(null)}
        onAddReference={handleAddReference}
      />
    );
  }
  return (
    <>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-3 lg:hidden">Browse by category</h2>
      <CategoryList categories={categories} onSelect={setActiveCategory} />
    </>
  );
}
