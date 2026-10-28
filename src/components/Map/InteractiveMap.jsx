import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Split, 
  X, 
  ArrowRight, 
  Globe 
} from 'lucide-react';
import { BELARUS_BORDER, BELARUS_MASK, BELARUS_BOUNDS, BELARUS_CENTER } from '../../data/belarusBorder';

export const InteractiveMap = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  theme = 'dark'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [activeCardLoc, setActiveCardLoc] = useState(null);

  const isDark = theme === 'dark';

  // Build optimized Satellite-only map style for Belarus
  const buildSatelliteStyle = () => {
    return {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=y&hl=ru&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=y&hl=ru&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=y&hl=ru&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=y&hl=ru&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          maxzoom: 19,
          bounds: [22.85, 51.05, 33.15, 56.40],
          attribution: 'Google Satellite'
        },
        'belarus-mask': {
          type: 'geojson',
          data: BELARUS_MASK
        },
        'belarus-border': {
          type: 'geojson',
          data: BELARUS_BORDER
        }
      },
      layers: [
        // 1. High-Res Satellite Imagery (Restricted to Belarus)
        {
          id: 'satellite-base',
          type: 'raster',
          source: 'satellite-tiles',
          minzoom: 0,
          maxzoom: 20
        },
        // 2. Vignette/Mask outside Belarus territory
        {
          id: 'belarus-mask-layer',
          type: 'fill',
          source: 'belarus-mask',
          paint: {
            'fill-color': '#05070a',
            'fill-opacity': isDark ? 0.65 : 0.45
          }
        },
        // 3. Glowing Outer Red Border
        {
          id: 'belarus-border-glow',
          type: 'line',
          source: 'belarus-border',
          paint: {
            'line-color': '#ef4444',
            'line-width': 6,
            'line-blur': 4,
            'line-opacity': 0.65
          }
        },
        // 4. Crisp Inner State Border
        {
          id: 'belarus-border-main',
          type: 'line',
          source: 'belarus-border',
          paint: {
            'line-color': '#dc2626',
            'line-width': 2.2,
            'line-opacity': 0.95
          }
        },
        // 5. Delicate White/Red Dashed Accent Line
        {
          id: 'belarus-border-dash',
          type: 'line',
          source: 'belarus-border',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.2,
            'line-dasharray': [3, 4],
            'line-opacity': 0.75
          }
        }
      ]
    };
  };

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildSatelliteStyle(),
      center: BELARUS_CENTER, // Geometric center of Belarus [27.95, 53.70]
      zoom: 7.2,
      minZoom: 6.5,
      maxZoom: 19,
      maxBounds: BELARUS_BOUNDS, // Strictly limited to Belarus + ~10km border buffer
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Init once

  // Update theme mask on theme change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (map.getLayer('belarus-mask-layer')) {
        map.setPaintProperty('belarus-mask-layer', 'fill-opacity', isDark ? 0.65 : 0.45);
      }
    } catch (e) {}
  }, [isDark]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous DOM markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id || activeCardLoc?.id === loc.id;

      // Pin DOM container with zero background and 100% transparent bounds
      const el = document.createElement('div');
      el.className = 'cursor-pointer select-none group';
      el.style.width = '32px';
      el.style.height = '42px';
      el.style.backgroundColor = 'transparent';
      el.style.border = 'none';

      // Clean SVG pin colors
      const pinFill = isSelected
        ? (isDark ? '#ffffff' : '#b45309')
        : (isDark ? '#18181b' : '#2c261e');

      const pinStroke = isSelected
        ? (isDark ? '#dc2626' : '#fef3c7')
        : (isDark ? '#ffffff' : '#f8f5ee');

      const pinCore = isSelected
        ? (isDark ? '#dc2626' : '#ffffff')
        : (isDark ? '#ffffff' : '#f8f5ee');

      el.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center pointer-events-auto">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="group-hover:scale-115 transition-transform duration-200" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5));">
            <path d="M16 1C7.716 1 1 7.716 1 16C1 26.5 16 41 16 41C16 41 31 26.5 31 16C31 7.716 24.284 1 16 1Z" 
                  fill="${pinFill}" 
                  stroke="${pinStroke}" 
                  stroke-width="2" 
                  stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="5" fill="${pinCore}"/>
          </svg>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="${isDark ? 'bg-black/90 text-white border-neutral-700/60' : 'bg-[#fbf9f4]/95 text-[#2c261e] border-[#e5dcce] shadow-xl'} text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-2xl whitespace-nowrap border backdrop-blur-xl">
              ${loc.title}
            </div>
            <div class="w-1.5 h-1.5 ${isDark ? 'bg-black/90 border-neutral-700/60' : 'bg-[#fbf9f4]/95 border-[#e5dcce]'} border-r border-b rotate-45 -mt-1"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        setActiveCardLoc(loc);
        map.flyTo({
          center: [loc.coords[1], loc.coords[0]],
          zoom: 15.5,
          duration: 700,
          essential: true
        });
      });

      const marker = new maplibregl.Marker({ 
        element: el, 
        anchor: 'bottom',
        offset: [0, 0]
      })
        .setLngLat([loc.coords[1], loc.coords[0]])
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (selectedLocation) {
      setActiveCardLoc(selectedLocation);
      map.flyTo({
        center: [selectedLocation.coords[1], selectedLocation.coords[0]],
        zoom: 15.5,
        duration: 700,
        essential: true
      });
    }
  }, [locations, selectedLocation, activeCardLoc, isDark]);

  const fitAllBelarus = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: BELARUS_CENTER,
      zoom: 7.2,
      duration: 800
    });
  };

  const centerMinsk = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [27.5615, 53.9045],
      zoom: 13.5,
      duration: 700
    });
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border shadow-2xl transition-colors ${
      isDark ? 'border-neutral-800/60 bg-[#07090d]' : 'border-[#e5dcce] bg-[#efe8dc]'
    }`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Sleek Horizontal Control Capsule */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all">
        <div className={`flex items-center gap-1 p-0.5 rounded-xl ${
          isDark ? 'bg-black/75 border border-neutral-800/80 text-white' : 'bg-[#fbf9f4]/95 border border-[#e5dcce] text-[#2c261e] shadow-sm'
        }`}>
          {/* Fit all Belarus */}
          <button
            onClick={fitAllBelarus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isDark ? 'bg-white text-black shadow-xs' : 'bg-[#2c261e] text-[#fbf9f4] shadow-xs'
            }`}
            title="Охватить всю Беларусь"
          >
            <Globe className="w-3.5 h-3.5 text-red-500" />
            <span>Вся Беларусь</span>
          </button>

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-neutral-800' : 'bg-[#e5dcce]'}`} />

          {/* Center Minsk */}
          <button
            onClick={centerMinsk}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
            }`}
            title="Центр Минска"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Минск</span>
          </button>

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-neutral-800' : 'bg-[#e5dcce]'}`} />

          {/* Zoom In */}
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
            }`}
            title="Приблизить (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
            }`}
            title="Отдалить (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Card for Selected Location */}
      {activeCardLoc && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all ${
            isDark 
              ? 'bg-black/85 border-neutral-700/60 text-white' 
              : 'bg-[#fbf9f4]/95 border-[#e5dcce] text-[#2c261e] shadow-xl'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black shrink-0 border border-neutral-700/50">
                  <img
                    src={activeCardLoc.modernImage}
                    alt={activeCardLoc.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className={`flex items-center gap-2 text-[10px] font-mono mb-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-[#8a7a66]'
                  }`}>
                    <span className="font-semibold text-red-500">{activeCardLoc.district}</span>
                    <span>•</span>
                    <span>{activeCardLoc.archiveYear}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">
                    {activeCardLoc.title}
                  </h4>
                  <p className={`text-xs line-clamp-1 mt-0.5 ${
                    isDark ? 'opacity-75' : 'text-[#635747]'
                  }`}>
                    {activeCardLoc.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCardLoc(null)}
                className={`p-1 rounded-lg ${
                  isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-[#8a7a66] hover:text-[#2c261e]'
                }`}
                aria-label="Закрыть карточку"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className={`mt-3 pt-3 border-t flex items-center gap-2 ${
              isDark ? 'border-neutral-800/60' : 'border-[#e5dcce]'
            }`}>
              <button
                onClick={() => onSelectLocation(activeCardLoc)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-[#2c261e] text-[#fbf9f4] hover:bg-[#1a1612] shadow-xs'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Сравнить эпохи</span>
              </button>

              <button
                onClick={() => onSelectLocation(activeCardLoc)}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark 
                    ? 'border-neutral-700/60 hover:bg-neutral-800/40 text-neutral-300' 
                    : 'border-[#e0d6c5] hover:bg-[#efe8dc] text-[#5e5344]'
                }`}
                title="Подробная архивная справка"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
