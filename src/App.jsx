import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { MapFilters } from './components/Map/MapFilters';
import { LocationDetail } from './components/LocationModal/LocationDetail';
import { StoryWizard } from './components/AddStory/StoryWizard';
import { AiEthicsDemo } from './components/AiEthics/AiEthicsDemo';
import { QuestsView } from './components/Quests/QuestsView';
import { SchoolGuideView } from './components/Guide/SchoolGuideView';
import { CatalogView } from './components/Catalog/CatalogView';
import { Toast } from './components/Common/Toast';
import { INITIAL_LOCATIONS } from './data/locations';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mesto_pomnit_minsk_locations_v2';

export function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'catalog' | 'ai' | 'quests' | 'guide'
  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LOCATIONS;
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [wizardPreselectedLoc, setWizardPreselectedLoc] = useState(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    } catch (e) {
      console.error(e);
    }
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = loc.title.toLowerCase().includes(q);
        const matchSub = loc.subtitle.toLowerCase().includes(q);
        const matchDist = loc.district.toLowerCase().includes(q);
        const matchVoices = (loc.voices || []).some(
          (v) => v.author.toLowerCase().includes(q) || v.fullText.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchSub && !matchDist && !matchVoices) {
          return false;
        }
      }

      if (selectedCategory !== 'all') {
        const hasCategory = (loc.categories || []).includes(selectedCategory);
        const hasVoiceCategory = (loc.voices || []).some((v) => v.topic === selectedCategory);
        if (!hasCategory && !hasVoiceCategory) return false;
      }

      return true;
    });
  }, [locations, searchQuery, selectedCategory]);

  const handleSaveStory = (locationId, locationName, newVoice) => {
    setLocations((prevLocations) => {
      let updated;
      const existingIndex = prevLocations.findIndex((l) => l.id === locationId);

      if (existingIndex >= 0) {
        updated = [...prevLocations];
        const target = updated[existingIndex];
        const newVoices = [newVoice, ...(target.voices || [])];
        updated[existingIndex] = {
          ...target,
          voices: newVoices,
          stats: {
            ...target.stats,
            witnessCount: (target.stats?.witnessCount || target.voices.length) + 1,
          },
        };
      } else {
        const newLocation = {
          id: `custom-loc-${Date.now()}`,
          title: locationName,
          subtitle: `Личные свидетельства жителей · ${newVoice.year}`,
          district: 'Центральный район',
          coords: [53.9045 + (Math.random() - 0.5) * 0.02, 27.5615 + (Math.random() - 0.5) * 0.02],
          archiveYear: newVoice.year,
          modernYear: '2026 г.',
          categories: ['childhood', 'changes'],
          archiveImage: '/images/locations/nemiga_archive.jpg',
          modernImage: '/images/locations/nemiga_modern.jpg',
          archiveImageCaption: 'Архивный снимок из семейной коллекции очевидца.',
          modernImageCaption: 'Современный вид улицы, 2026 год.',
          historicalFact: 'Точка добавлена участниками краеведческого проекта «Место помнит». Материалы переданы в архив устной истории Минска.',
          stats: {
            witnessCount: 1,
            archiveCount: 0,
            audioCount: 1,
          },
          voices: [newVoice],
        };
        updated = [newLocation, ...prevLocations];
      }

      return updated;
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#a1a1aa', '#71717a'],
    });

    showToast('Свидетельство успешно сохранено и добавлено в архив Минска!');
  };

  const handleOpenAddForSpecificLocation = (loc) => {
    setWizardPreselectedLoc(loc);
    setIsAddWizardOpen(true);
  };

  const handleOpenMapWithLocation = (loc) => {
    setActiveTab('map');
    setSelectedLocation(loc);
  };

  const totalVoices = locations.reduce((sum, l) => sum + (l.voices?.length || 0), 0);

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-neutral-100 selection:bg-neutral-800 selection:text-white pb-16 md:pb-0">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddWizard={() => {
          setWizardPreselectedLoc(null);
          setIsAddWizardOpen(true);
        }}
        storyCount={totalVoices}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        
        {/* TAB 1: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <div className="space-y-3 sm:space-y-4">
            <MapFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              totalCount={locations.length}
              filteredCount={filteredLocations.length}
            />

            <div className="h-[calc(100vh-235px)] min-h-[460px] sm:h-[640px] w-full">
              <InteractiveMap
                locations={filteredLocations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                isPickingLocation={isPickingLocation}
                onCoordinatePicked={(coords) => {
                  setIsPickingLocation(false);
                  setIsAddWizardOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG */}
        {activeTab === 'catalog' && (
          <CatalogView
            locations={filteredLocations}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onOpenMapLocation={handleOpenMapWithLocation}
          />
        )}

        {/* TAB 3: AI ETHICS & FREEDEEPSEEK */}
        {activeTab === 'ai' && (
          <AiEthicsDemo />
        )}

        {/* TAB 4: QUESTS */}
        {activeTab === 'quests' && (
          <QuestsView />
        )}

        {/* TAB 5: SCHOOL & ARCHIVE GUIDE */}
        {activeTab === 'guide' && (
          <SchoolGuideView locations={locations} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-850 bg-neutral-950/80 py-6 sm:py-8 px-4 text-center text-xs text-neutral-400 mb-16 md:mb-0">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-semibold text-sm text-white">
            «Место помнит: Интерактивная карта воспоминаний о малой родине»
          </div>
          <p className="max-w-xl mx-auto text-neutral-500 text-[11px] leading-relaxed">
            «Место помнит не потому, что у него есть одна официальная история, а потому, что люди продолжают рассказывать о нём». Проект разработан в строгом соответствии с принципами сохранения локальной памяти и бережной исследовательской этики.
          </p>
          <div className="text-[10px] font-mono text-neutral-400 pt-2 flex items-center justify-center gap-3">
            <span>Минск · 2026</span>
            <span>•</span>
            <span>FreeDeepSeek AI Core</span>
            <span>•</span>
            <a href="https://pomnit.vercel.app" className="text-white hover:underline">pomnit.vercel.app</a>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddWizard={() => {
          setWizardPreselectedLoc(null);
          setIsAddWizardOpen(true);
        }}
      />

      {/* Location Modal */}
      {selectedLocation && (
        <LocationDetail
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onOpenAddStoryForLocation={handleOpenAddForSpecificLocation}
        />
      )}

      {/* 5-step Story Wizard */}
      <StoryWizard
        isOpen={isAddWizardOpen}
        onClose={() => setIsAddWizardOpen(false)}
        locations={locations}
        preselectedLocation={wizardPreselectedLoc}
        onSaveStory={handleSaveStory}
        onPickCoordinateOnMap={() => {
          setIsAddWizardOpen(false);
          setIsPickingLocation(true);
          setActiveTab('map');
        }}
      />

      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
export default App;
