import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { MapFilters } from './components/Map/MapFilters';
import { LocationDetail } from './components/LocationModal/LocationDetail';
import { AiEthicsDemo } from './components/AiEthics/AiEthicsDemo';
import { CatalogView } from './components/Catalog/CatalogView';
import { CompareView } from './components/Compare/CompareView';
import { NavigatorModal } from './components/Navigation/NavigatorModal';
import { Toast } from './components/Common/Toast';
import { INITIAL_LOCATIONS } from './data/locations';

const THEME_STORAGE_KEY = 'mesto_pomnit_theme_v2';

export function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'catalog' | 'compare' | 'ai'
  const [locations] = useState(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);

  // Theme Support: Dark / Light
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark'; // Default to sleek OLED black
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = loc.title.toLowerCase().includes(q);
        const matchSub = (loc.subtitle || '').toLowerCase().includes(q);
        const matchDist = (loc.district || '').toLowerCase().includes(q);
        const matchFact = (loc.historicalFact || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchDist && !matchFact) {
          return false;
        }
      }

      if (selectedCategory !== 'all') {
        const hasCategory = loc.category === selectedCategory || (loc.categories || []).includes(selectedCategory);
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [locations, searchQuery, selectedCategory]);

  const handleOpenMapWithLocation = (loc) => {
    setActiveTab('map');
    setSelectedLocation(loc);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 pb-16 md:pb-0 ${
      isDark 
        ? 'bg-black text-neutral-100 selection:bg-neutral-800 selection:text-white' 
        : 'bg-[#f8f5ee] text-[#2c261e] selection:bg-[#e8decd] selection:text-[#1a1612]'
    }`}>
      
      {/* Translucent Header with Theme Switcher & Navigator */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNavigator={() => setIsNavigatorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        
        {/* TAB 1: 2D TOP-DOWN / REAL 3D BUILDINGS MAP */}
        {activeTab === 'map' && (
          <div className="space-y-3 sm:space-y-4">
            <MapFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              theme={theme}
            />

            <div className="h-[calc(100vh-235px)] min-h-[480px] sm:h-[660px] w-full">
              <InteractiveMap
                locations={filteredLocations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ARCHIVE CATALOG */}
        {activeTab === 'catalog' && (
          <CatalogView
            locations={filteredLocations}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onOpenMapLocation={handleOpenMapWithLocation}
            theme={theme}
          />
        )}

        {/* TAB 3: BEFORE / AFTER COMPARISON */}
        {activeTab === 'compare' && (
          <CompareView
            locations={filteredLocations.length > 0 ? filteredLocations : locations}
            onOpenMapLocation={handleOpenMapWithLocation}
            theme={theme}
          />
        )}

        {/* TAB 4: AI RESEARCHER WITH PERSISTENT CHATS */}
        {activeTab === 'ai' && (
          <AiEthicsDemo theme={theme} />
        )}
      </main>

      {/* Translucent Footer */}
      <footer className={`border-t py-6 sm:py-8 px-4 text-center text-xs backdrop-blur-xl mb-16 md:mb-0 transition-colors ${
        isDark 
          ? 'border-neutral-800/60 bg-black/60 text-neutral-400' 
          : 'border-[#e5dcce] bg-[#fbf9f4]/85 text-[#736859]'
      }`}>
        <div className="max-w-4xl mx-auto space-y-2">
          <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#2c261e]'}`}>
            «Место помнит: Интерактивный архив исторической памяти Минска»
          </div>
          <p className="max-w-xl mx-auto text-[11px] leading-relaxed">
            Проект фотофиксации и архитектурного сопоставления утраченного и сохранённого наследия. Подлинные архивные кадры и интерактивная картография Беларуси.
          </p>
          <div className="text-[10px] font-mono pt-2 flex items-center justify-center gap-3">
            <a href="https://pomnit.vercel.app" className={`hover:underline ${isDark ? 'text-white' : 'text-[#2c261e] font-semibold'}`}>
              pomnit.vercel.app
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
      />

      {/* Full Navigator Modal (Opened from Header) */}
      <NavigatorModal
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        locations={locations}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
        }}
        theme={theme}
      />

      {/* Location Modal */}
      {selectedLocation && (
        <LocationDetail
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          theme={theme}
        />
      )}

      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
export default App;
