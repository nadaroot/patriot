import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Box, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Split,
  X,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';

export const InteractiveMap = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  theme = 'dark'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [is3D, setIs3D] = useState(false); // Clean flat 2D top-down view by default
  const [bearing, setBearing] = useState(0);
  const [activeCardLoc, setActiveCardLoc] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of Minsk: [lng, lat]
    const minskCenter = [27.5615, 53.9045];

    // High quality vector style with real 3D buildings support
    const mapStyle = isDark 
      ? 'https://tiles.openfreemap.org/styles/dark'
      : 'https://tiles.openfreemap.org/styles/liberty';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: minskCenter,
      zoom: 13.6,
      minZoom: 10,
      maxZoom: 19,
      pitch: 0, // Clean 2D flat top-down by default
      bearing: 0,
      maxPitch: 75,
      attributionControl: false,
    });

    map.on('rotate', () => setBearing(Math.round(map.getBearing())));

    map.on('load', () => {
      // Add or enhance real 3D vector buildings extrusion
      try {
        if (!map.getLayer('3d-buildings-extrusion')) {
          map.addLayer({
            id: '3d-buildings-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], 15],
                0, isDark ? '#27272a' : '#d4d4d8',
                25, isDark ? '#3f3f46' : '#a1a1aa',
                60, isDark ? '#52525b' : '#71717a',
                100, isDark ? '#71717a' : '#52525b'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                14, ['coalesce', ['get', 'render_height'], 15]
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                14, ['coalesce', ['get', 'render_min_height'], 0]
              ],
              'fill-extrusion-opacity': 0.0, // 0 in 2D mode, elevates to 0.9 in 3D
              'fill-extrusion-vertical-gradient': true
            }
          });
        }
      } catch (err) {
        console.warn('3D building layer setup:', err);
      }

      // Add WebGL ground anchor circles source
      const geojsonFeatures = locations.map((loc) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.coords[1], loc.coords[0]]
        },
        properties: {
          id: loc.id,
          title: loc.title
        }
      }));

      if (!map.getSource('locations-points')) {
        map.addSource('locations-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geojsonFeatures
          }
        });

        // WebGL ground rings that never drift
        map.addLayer({
          id: 'location-rings',
          type: 'circle',
          source: 'locations-points',
          paint: {
            'circle-radius': 14,
            'circle-color': isDark ? '#ffffff' : '#000000',
            'circle-opacity': 0.2,
            'circle-pitch-alignment': 'map'
          }
        });

        map.addLayer({
          id: 'location-dots',
          type: 'circle',
          source: 'locations-points',
          paint: {
            'circle-radius': 4.5,
            'circle-color': isDark ? '#ffffff' : '#000000',
            'circle-stroke-width': 2,
            'circle-stroke-color': isDark ? '#000000' : '#ffffff',
            'circle-pitch-alignment': 'map'
          }
        });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous DOM markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Update WebGL source data if ready
    if (map.getSource('locations-points')) {
      const geojsonFeatures = locations.map((loc) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.coords[1], loc.coords[0]]
        },
        properties: {
          id: loc.id,
          title: loc.title
        }
      }));
      map.getSource('locations-points').setData({
        type: 'FeatureCollection',
        features: geojsonFeatures
      });
    }

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id || activeCardLoc?.id === loc.id;

      // Pin DOM container with explicit fixed dimensions
      const el = document.createElement('div');
      el.className = 'cursor-pointer select-none';
      el.style.width = '28px';
      el.style.height = '36px';

      // SVG teardrop pin pointing strictly at bottom center (14, 36) with translucent popup
      el.innerHTML = `
        <div class="relative w-full h-full group">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none" class="transition-transform duration-150">
            <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" 
                  fill="${isSelected ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#18181b' : '#f8fafc')}" 
                  stroke="${isSelected ? (isDark ? '#000000' : '#ffffff') : (isDark ? '#ffffff' : '#0f172a')}" 
                  stroke-width="1.8"/>
            <circle cx="14" cy="13" r="4.5" fill="${isSelected ? (isDark ? '#000000' : '#ffffff') : (isDark ? '#ffffff' : '#0f172a')}"/>
          </svg>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="${isDark ? 'bg-black/60 text-white border-neutral-700/60' : 'bg-white/80 text-black border-neutral-300/80'} text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-2xl whitespace-nowrap border backdrop-blur-xl">
              ${loc.title}
            </div>
            <div class="w-1.5 h-1.5 ${isDark ? 'bg-black/60 border-neutral-700/60' : 'bg-white/80 border-neutral-300/80'} border-r border-b rotate-45 -mt-1"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        setActiveCardLoc(loc);
        map.flyTo({
          center: [loc.coords[1], loc.coords[0]],
          zoom: 16.2,
          pitch: is3D ? 60 : 0,
          duration: 900,
          essential: true
        });
      });

      // Anchor strictly at bottom center so pin tip touches exact ground coordinate
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
        zoom: 16.2,
        pitch: is3D ? 60 : 0,
        duration: 900,
        essential: true
      });
    }
  }, [locations, selectedLocation, activeCardLoc, is3D, isDark]);

  // Toggle between 2D Top-down and Real 3D Extruded Buildings
  const toggle3DMode = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    if (is3D) {
      // Switch back to 2D
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      setIs3D(false);
      try {
        if (map.getLayer('3d-buildings-extrusion')) {
          map.setPaintProperty('3d-buildings-extrusion', 'fill-extrusion-opacity', 0.0);
        }
      } catch (e) {}
    } else {
      // Activate Real 3D Extrusions + Tilt
      map.easeTo({ pitch: 60, bearing: -18, duration: 900 });
      setIs3D(true);
      try {
        if (map.getLayer('3d-buildings-extrusion')) {
          map.setPaintProperty('3d-buildings-extrusion', 'fill-extrusion-opacity', 0.92);
        }
      } catch (e) {}
    }
  };

  const resetBearing = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({ bearing: 0, duration: 500 });
  };

  const centerMinsk = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [27.5615, 53.9045],
      zoom: 13.6,
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -18 : 0,
      duration: 800
    });
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border shadow-2xl transition-colors ${
      isDark ? 'border-neutral-800/60 bg-black' : 'border-neutral-200/80 bg-neutral-100'
    }`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Compact Translucent Controls */}
      <div className={`absolute top-3 right-3 z-20 flex flex-col gap-1 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
        isDark 
          ? 'bg-black/60 border-neutral-800/70 text-white' 
          : 'bg-white/75 border-neutral-200/80 text-neutral-900'
      }`}>
        
        {/* Toggle Real 3D Buildings / 2D */}
        <button
          onClick={toggle3DMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            is3D 
              ? isDark ? 'bg-white text-black shadow-md' : 'bg-neutral-900 text-white shadow-md'
              : isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
          }`}
          title={is3D ? 'Включён режим 3D зданий. Нажмите для 2D' : 'Включить реальные 3D здания города'}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{is3D ? '3D Здания' : '2D Карта'}</span>
        </button>

        {/* Compass / Reset Rotation */}
        <button
          onClick={resetBearing}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
            isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
          }`}
          title={`Поворот карты: ${bearing}° (Нажмите для сброса на север)`}
        >
          <Compass 
            className="w-4 h-4 transition-transform duration-200" 
            style={{ transform: `rotate(${-bearing}deg)` }}
          />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
            isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
          }`}
          title="Приблизить карту (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
            isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
          }`}
          title="Отдалить карту (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Center Minsk */}
        <button
          onClick={centerMinsk}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors border-t ${
            isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50 border-neutral-800/60' : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60 border-neutral-200'
          }`}
          title="Центрировать на историческом центре Минска"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Frosted Glass Floating Card for Selected Location ("заходя там тоже должен быть прозрачный фон") */}
      {activeCardLoc && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all ${
            isDark 
              ? 'bg-black/60 border-neutral-700/60 text-white' 
              : 'bg-white/80 border-neutral-300/80 text-neutral-900'
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
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mb-0.5">
                    <span className="font-semibold text-white">{activeCardLoc.district}</span>
                    <span>•</span>
                    <span>{activeCardLoc.archiveYear}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">
                    {activeCardLoc.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {activeCardLoc.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCardLoc(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
                aria-label="Закрыть карточку"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center gap-2">
              <button
                onClick={() => onSelectLocation(activeCardLoc)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Сравнить эпохи</span>
              </button>

              <button
                onClick={() => onSelectLocation(activeCardLoc)}
                className="p-2 rounded-xl border border-neutral-700/60 hover:bg-neutral-800/40 text-neutral-300 transition-colors"
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
