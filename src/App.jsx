import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { collection, onSnapshot, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import SearchBar from './components/SearchBar';
import CategoryList from './components/CategoryList';
import LabelList from './components/LabelList';
const CategoryDetail = lazy(() => import('./components/CategoryDetail'));
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DataTable from './components/DataTable';
import Breadcrumb from './components/Breadcrumb';
import DetailPanel from './components/DetailPanel';
const HelpTour = lazy(() => import('./components/HelpTour'));
import { searchSounds, removeReferenceByUrl, hasReferenceUrl } from './lib/refs';
import { useTheme } from './lib/useTheme';
import { useSidebarWidth } from './lib/useSidebarWidth';
import { toTitleCase, normalize } from './lib/format';
import { getLabelOrder } from './lib/labelOrder';
import { features } from './lib/config';
import { useAuth } from './lib/auth';
import LoginDialog from './components/LoginDialog';
import AnimatedAuthButton from './components/AnimatedAuthButton';

const SECTION_ORDER = [
  'Human vocal and speech sounds',
  'Human respiratory and involuntary sounds',
  'Human digestive, body, and contact sounds',
  'Baby and infant sounds',
  'Animal sounds',
  'Liquid and fluid sounds',
  'Social and crowd sounds',
  'Nature and environmental sounds',
  'Impact and collision sounds',
  'Friction and texture sounds',
  'Metallic and resonant sounds',
  'Mechanical, appliance, and industrial sounds',
  'Air and Pressure sounds',
  'Electronic, alert, and interface sounds',
  'Music and tonal sounds',
  'Food preparation and cooking sounds',
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
  const [showTour, setShowTour] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, admin, signOut } = useAuth();
  const canDelete = admin;
  const showAdminLogin = new URLSearchParams(window.location.search).get('admin') === 'true' || !!user;

  const handleSelectCategory = useCallback((cat) => {
    setActiveCategory(cat);
    setQuery('');
  }, []);
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    if (selectedSound) {
      const updated = sounds.find((s) => s.id === selectedSound.id);
      if (updated) setSelectedSound(updated);
    }
  }, [sounds]);
  const { width: sidebarWidth, isDragging: isSidebarDragging, startDrag: startSidebarDrag, resetWidth: resetSidebarWidth } = useSidebarWidth();

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
    const byNormalized = new Map();
    for (const s of sounds) {
      if (!s.section) continue;
      const key = normalize(s.section);
      if (!byNormalized.has(key)) {
        byNormalized.set(key, { displayName: s.section, count: 0 });
      }
      byNormalized.get(key).count++;
    }
    const ordered = SECTION_ORDER
      .filter((name) => byNormalized.has(normalize(name)))
      .map((name) => {
        const entry = byNormalized.get(normalize(name));
        return { name: entry.displayName, count: entry.count };
      });
    const extras = [...byNormalized.entries()]
      .filter(([key]) => !SECTION_ORDER.some((s) => normalize(s) === key))
      .map(([, entry]) => ({ name: entry.displayName, count: entry.count }));
    return [...ordered, ...extras];
  }, [sounds]);

  const searchResults = useMemo(() => searchSounds(sounds, query), [sounds, query]);

  const categorySounds = useMemo(() => {
    if (!activeCategory) return [];
    const filtered = sounds.filter((s) => s.section === activeCategory);
    const order = getLabelOrder(activeCategory);
    if (order) {
      const indexMap = new Map(order.map((label, i) => [label.toLowerCase(), i]));
      return [...filtered].sort((a, b) => {
        const ai = indexMap.get(a.canonicalLabel.toLowerCase());
        const bi = indexMap.get(b.canonicalLabel.toLowerCase());
        const aVal = ai !== undefined ? ai : order.length;
        const bVal = bi !== undefined ? bi : order.length;
        return aVal - bVal || a.canonicalLabel.localeCompare(b.canonicalLabel);
      });
    }
    return [...filtered].sort((a, b) => (a.subcategory || '').localeCompare(b.subcategory || '') || a.canonicalLabel.localeCompare(b.canonicalLabel));
  }, [sounds, activeCategory]);

  const handleAddReference = useCallback(async (soundId, url) => {
    const soundRef = doc(db, 'sounds', soundId);
    const snap = await getDoc(soundRef);
    const current = snap.exists() ? (snap.data().references || []) : [];
    if (hasReferenceUrl(current, url)) {
      throw new Error('DUPLICATE_URL');
    }
    await updateDoc(soundRef, {
      references: arrayUnion({ url, addedBy: 'user', addedAt: new Date().toISOString() }),
    });
  }, []);

  const handleDeleteReference = useCallback(async (soundId, ref) => {
    const soundRef = doc(db, 'sounds', soundId);
    const snap = await getDoc(soundRef);
    if (!snap.exists()) return;
    const current = snap.data().references || [];
    const updated = removeReferenceByUrl(current, ref.url);
    await updateDoc(soundRef, { references: updated });
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
        onSelectCategory={handleSelectCategory}
        theme={theme}
        onToggleTheme={toggleTheme}
        width={sidebarWidth}
        isDragging={isSidebarDragging}
        onStartDrag={startSidebarDrag}
        onResetWidth={resetSidebarWidth}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTour(true)}
                title="How to use"
                className="hidden shrink-0 w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center text-ink-faint hover:text-accent hover:border-accent/50 transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-[16px]">help_outline</span>
              </button>
              {features.showTracker && (
                <a
                  href="https://ai-products.meeamitech.com/annotation_tracker2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Annotation Tracker"
                  className="shrink-0 w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center text-ink-faint hover:text-accent hover:border-accent/50 transition-colors duration-150"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              )}
              {showAdminLogin && (
                <AnimatedAuthButton
                  variant="mobile"
                  isLoggedIn={!!user}
                  isAdmin={admin}
                  onLogin={() => setShowLogin(true)}
                  onLogout={signOut}
                />
              )}
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
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          <SearchBar query={query} onQueryChange={setQuery} />
          <div className="mt-6 sm:mt-8">
            {renderContent(isSearching, searchResults, activeCategory, categorySounds, categories, handleSelectCategory, handleAddReference, handleDeleteReference, canDelete)}
          </div>
        </main>
      </div>

      {/* Desktop layout */}
      <div
        className={`hidden lg:flex lg:flex-col lg:min-h-screen ${isSidebarDragging ? '' : 'transition-[margin-left] duration-100'}`}
        style={{ marginLeft: sidebarWidth }}
      >
        <TopBar query={query} onQueryChange={setQuery} onHelpClick={() => setShowTour(true)} user={user} admin={admin} onLogin={() => setShowLogin(true)} onLogout={signOut} showAdmin={showAdminLogin} />
        <main className="flex-1 overflow-y-auto p-6">
            <Breadcrumb
              items={[
                { label: 'All Categories', onClick: () => handleSelectCategory(null) },
                ...(activeCategory ? [{ label: toTitleCase(activeCategory) }] : []),
                ...(isSearching ? [{ label: `Search: ${query}` }] : []),
              ]}
            />
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] font-semibold text-ink leading-tight tracking-tight">
                  {isSearching
                    ? <>Search: &lsquo;{query}&rsquo;</>
                    : activeCategory
                      ? toTitleCase(activeCategory)
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
              key={activeCategory ?? (isSearching ? 'search' : 'all')}
              sounds={isSearching ? searchResults : activeCategory ? categorySounds : sounds}
              onRowClick={(sound) => setSelectedSound(sound)}
              preserveOrder={!!(activeCategory && getLabelOrder(activeCategory))}
            />
        </main>
      </div>

      {/* Detail panel */}
      {selectedSound && (
        <DetailPanel
          sound={selectedSound}
          onClose={() => setSelectedSound(null)}
          onAddReference={handleAddReference}
          onDeleteReference={handleDeleteReference}
          canDelete={canDelete}
        />
      )}

      {/* Help tour */}
      {showTour && (
        <Suspense fallback={null}>
          <HelpTour onClose={() => setShowTour(false)} sounds={sounds} setSelectedSound={setSelectedSound} onQueryChange={setQuery} admin={admin} />
        </Suspense>
      )}

      {/* Login dialog */}
      {showLogin && (
        <LoginDialog onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}

function renderContent(isSearching, searchResults, activeCategory, categorySounds, categories, handleSelectCategory, handleAddReference, handleDeleteReference, canDelete) {
  if (isSearching) {
    return <LabelList sounds={searchResults} onAddReference={handleAddReference} onDeleteReference={handleDeleteReference} canDelete={canDelete} />;
  }
  if (activeCategory) {
    return (
      <Suspense fallback={<div className="py-8 text-center text-ink-faint text-sm">Loading…</div>}>
        <CategoryDetail
          category={activeCategory}
          sounds={categorySounds}
          onBack={() => handleSelectCategory(null)}
          onAddReference={handleAddReference}
          onDeleteReference={handleDeleteReference}
          canDelete={canDelete}
        />
      </Suspense>
    );
  }
  return (
    <>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-3 lg:hidden">Browse by category</h2>
      <CategoryList categories={categories} onSelect={handleSelectCategory} />
    </>
  );
}
