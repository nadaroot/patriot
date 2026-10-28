import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { MapFilters } from './components/Map/MapFilters';
import { LocationDetail } from './components/LocationModal/LocationDetail';
import { AiEthicsDemo } from './components/AiEthics/AiEthicsDemo';
import { CatalogView } from './components/Catalog/CatalogView';
import { CompareView } from './components/Compare/CompareView';
import { Toast } from './components/Common/Toast';
import { INITIAL_LOCATIONS } from './data/locations';

export function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'catalog' | 'compare' | 'ai'
  const [locations] = useState(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-neutral-100 selection:bg-neutral-800 selection:text-white pb-16 md:pb-0">
      
      {/* Translucent Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
            />

            <div className="h-[calc(100vh-235px)] min-h-[480px] sm:h-[660px] w-full">
              <InteractiveMap
                locations={filteredLocations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
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
          />
        )}

        {/* TAB 3: BEFORE / AFTER COMPARISON */}
        {activeTab === 'compare' && (
          <CompareView
            locations={filteredLocations.length > 0 ? filteredLocations : locations}
            onOpenMapLocation={handleOpenMapWithLocation}
          />
        )}

        {/* TAB 4: PATRIOT AI ASSISTANT */}
        {activeTab === 'ai' && (
          <AiEthicsDemo />
        )}
      </main>

      {/* Translucent Footer */}
      <footer className="border-t border-neutral-800/60 bg-black/60 backdrop-blur-xl py-6 sm:py-8 px-4 text-center text-xs text-neutral-400 mb-16 md:mb-0">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-semibold text-sm text-white">
            «Место помнит: Интерактивный архив исторической памяти Минска»
          </div>
          <p className="max-w-xl mx-auto text-neutral-400 text-[11px] leading-relaxed">
            Проект фотофиксации и архитектурного сопоставления утраченного и сохранённого наследия. Подлинные архивные кадры и 3D-картография.
          </p>
          <div className="text-[10px] font-mono text-neutral-400 pt-2 flex items-center justify-center gap-3">
            <span>Патриот AI Core</span>
            <span>•</span>
            <a href="https://pomnit.vercel.app" className="text-white hover:underline">pomnit.vercel.app</a>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Location Modal */}
      {selectedLocation && (
        <LocationDetail
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
export default App;
