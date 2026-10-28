import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Compass, Volume2, Split, Layers, Globe, Radio } from 'lucide-react';

export const InteractiveMap = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  isPickingLocation = false,
  onCoordinatePicked,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const [mapMode, setMapMode] = useState('dark'); // 'dark' | 'satellite'

  // Map tile layers without any API tokens needed:
  const TILE_LAYERS = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · Место помнит',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> Satellite High-Resolution · Место помнит',
        maxZoom: 19,
      }
    }
  };

  // Switch tile layer when mapMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const cfg = TILE_LAYERS[mapMode] || TILE_LAYERS.dark;
    const newLayer = L.tileLayer(cfg.url, cfg.options).addTo(map);
    currentTileLayerRef.current = newLayer;
  }, [mapMode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Minsk: Oktyabrskaya / Nemiga
      const minskCenter = [53.9045, 27.5615];
      const map = L.map(mapContainerRef.current, {
        center: minskCenter,
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const cfg = TILE_LAYERS[mapMode] || TILE_LAYERS.dark;
      const tile = L.tileLayer(cfg.url, cfg.options).addTo(map);
      currentTileLayerRef.current = tile;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      if (isPickingLocation && onCoordinatePicked) {
        onCoordinatePicked([e.latlng.lat, e.latlng.lng]);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, onCoordinatePicked]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const voiceCount = loc.voices ? loc.voices.length : (loc.stats?.witnessCount || 1);

      // Clean, minimalist dark SVG pin with glowing white ring
      const markerHtml = `
        <div class="relative group cursor-pointer select-none">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
            isSelected 
              ? 'bg-white text-black ring-4 ring-white/30 scale-125 z-50 shadow-2xl' 
              : 'bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-110 shadow-lg border border-neutral-700 hover:border-white/40'
          }">
            <svg class="w-4 h-4 ${isSelected ? 'text-black' : 'text-neutral-200'}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="absolute -top-1.5 -right-1.5 ${
              isSelected ? 'bg-black text-white border-white' : 'bg-neutral-950 text-neutral-300 border-neutral-700'
            } border text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
              ${voiceCount}
            </span>
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="bg-neutral-950 text-neutral-100 text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-neutral-800 backdrop-blur-md">
              ${loc.title}
            </div>
            <div class="w-2 h-2 bg-neutral-950 border-r border-b border-neutral-800 rotate-45 -mt-1"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker(loc.coords, { icon: customIcon });

      const popupContent = `
        <div class="p-2 min-w-[240px] max-w-[280px] bg-neutral-950 text-neutral-100 font-sans rounded-xl border border-neutral-800">
          <div class="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold mb-1">
            <span>${loc.district}</span> · <span>${loc.archiveYear}</span>
          </div>
          <h4 class="font-bold text-sm leading-snug mb-1 text-white">${loc.title}</h4>
          <p class="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">${loc.subtitle}</p>
          <div class="flex items-center justify-between pt-2 border-t border-neutral-800">
            <span class="text-[10px] text-neutral-400 font-mono">Голосов: <strong class="text-white">${voiceCount}</strong></span>
            <button id="open-loc-${loc.id}" class="px-2.5 py-1 text-xs font-medium rounded-lg bg-white hover:bg-neutral-200 text-black transition-colors">
              Открыть →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'dark-leaflet-popup',
        maxWidth: 290,
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`open-loc-${loc.id}`);
        if (btn) {
          btn.onclick = () => onSelectLocation(loc);
        }
      });

      marker.addTo(markersGroup);
    });

    if (selectedLocation && selectedLocation.coords) {
      map.flyTo(selectedLocation.coords, 15, { duration: 1.2 });
    }
  }, [locations, selectedLocation, onSelectLocation]);

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Верхний статус: переключатель карты и подпись */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-neutral-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 shadow-lg flex items-center gap-2 text-xs font-medium text-neutral-200 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Интерактивная карта памяти</span>
          <span className="sm:hidden">Карта</span>
        </div>

        {/* Переключатель реалистичной карты: Спутник / Тёмная */}
        <div className="bg-neutral-950/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 shadow-lg flex items-center gap-1 text-xs">
          <button
            onClick={() => setMapMode('dark')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              mapMode === 'dark'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Тёмная</span>
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              mapMode === 'satellite'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Спутник</span>
          </button>
        </div>
      </div>

      {/* Подсказка в режиме выбора точки */}
      {isPickingLocation && (
        <div className="absolute top-3 right-3 z-20 bg-white text-black px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
          <MapPin className="w-4 h-4" />
          <span>Кликните по карте, чтобы отметить точку</span>
        </div>
      )}

      {/* Нижняя легенда */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-neutral-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-neutral-800 shadow-lg text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white inline-block"></span>
          <span className="text-neutral-300">Архив</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Split className="w-3 h-3 text-neutral-400" />
          <span>Шторка эпох</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3 h-3 text-neutral-400" />
          <span>Аудио</span>
        </div>
      </div>
    </div>
  );
};
