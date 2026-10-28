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
  Layers,
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
  const [mapType, setMapType] = useState('scheme'); // 'scheme' | 'satellite'
  const [bearing, setBearing] = useState(0);
  const [activeCardLoc, setActiveCardLoc] = useState(null);

  const isDark = theme === 'dark';

  // Initialize MapLibre with 100% reliable inline styles (never goes blank)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove old map instance if re-initializing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const minskCenter = [27.5615, 53.9045];

    // Build solid inline style that renders immediately with zero external JSON dependencies
    const inlineStyle = {
      version: 8,
      sources: {
        'carto-tiles': {
          type: 'raster',
          tiles: [
            isDark
              ? 'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
              : 'https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: 'CARTO'
        },
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Esri World Imagery'
        }
      },
      layers: [
        {
          id: 'carto-layer',
          type: 'raster',
          source: 'carto-tiles',
          minzoom: 0,
          maxzoom: 20,
          layout: {
            visibility: mapType === 'satellite' ? 'none' : 'visible'
          }
        },
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 20,
          layout: {
            visibility: mapType === 'satellite' ? 'visible' : 'none'
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: inlineStyle,
      center: minskCenter,
      zoom: 13.5,
      minZoom: 10,
      maxZoom: 19,
      pitch: is3D ? 58 : 0,
      bearing: is3D ? -18 : 0,
      maxPitch: 75,
      attributionControl: false,
    });

    map.on('rotate', () => setBearing(Math.round(map.getBearing())));

    map.on('load', () => {
      // Create 3D buildings geometries around central Minsk landmarks
      const buildingFeatures = locations.map((loc) => {
        const lng = loc.coords[1];
        const lat = loc.coords[0];
        const delta = 0.0006;
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - delta, lat - delta * 0.7],
              [lng + delta, lat - delta * 0.7],
              [lng + delta, lat + delta * 0.7],
              [lng - delta, lat + delta * 0.7],
              [lng - delta, lat - delta * 0.7]
            ]]
          },
          properties: {
            id: loc.id,
            title: loc.title,
            height: 25 + Math.floor((loc.id.length * 7) % 35)
          }
        };
      });

      map.addSource('3d-monuments-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: buildingFeatures
        }
      });

      map.addLayer({
        id: '3d-monuments-extrusion',
        type: 'fill-extrusion',
        source: '3d-monuments-source',
        paint: {
          'fill-extrusion-color': isDark ? '#52525b' : '#94a3b8',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': is3D ? 0.85 : 0.0,
          'fill-extrusion-vertical-gradient': true
        }
      });

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
          'circle-color': isDark ? '#ffffff' : '#0f172a',
          'circle-opacity': 0.15,
          'circle-pitch-alignment': 'map'
        }
      });

      map.addLayer({
        id: 'location-dots',
        type: 'circle',
        source: 'locations-points',
        paint: {
          'circle-radius': 4.5,
          'circle-color': isDark ? '#ffffff' : '#0f172a',
          'circle-stroke-width': 2,
          'circle-stroke-color': isDark ? '#000000' : '#ffffff',
          'circle-pitch-alignment': 'map'
        }
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [theme]); // Rebuild cleanly on theme change

  // Switch between scheme and satellite raster layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (map.getLayer('carto-layer') && map.getLayer('satellite-layer')) {
      map.setLayoutProperty('carto-layer', 'visibility', mapType === 'satellite' ? 'none' : 'visible');
      map.setLayoutProperty('satellite-layer', 'visibility', mapType === 'satellite' ? 'visible' : 'none');
    }
  }, [mapType]);

  // Update Markers
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

      el.innerHTML = `
        <div class="relative w-full h-full group">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none" class="transition-transform duration-150">
            <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" 
                  fill="${isSelected ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#18181b' : '#ffffff')}" 
                  stroke="${isSelected ? (isDark ? '#000000' : '#ffffff') : (isDark ? '#ffffff' : '#0f172a')}" 
                  stroke-width="1.8"/>
            <circle cx="14" cy="13" r="4.5" fill="${isSelected ? (isDark ? '#000000' : '#ffffff') : (isDark ? '#ffffff' : '#0f172a')}"/>
          </svg>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="${isDark ? 'bg-black/75 text-white border-neutral-700/60' : 'bg-white/90 text-slate-900 border-slate-300 shadow-md'} text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-2xl whitespace-nowrap border backdrop-blur-xl">
              ${loc.title}
            </div>
            <div class="w-1.5 h-1.5 ${isDark ? 'bg-black/75 border-neutral-700/60' : 'bg-white/90 border-slate-300'} border-r border-b rotate-45 -mt-1"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        setActiveCardLoc(loc);
        map.flyTo({
          center: [loc.coords[1], loc.coords[0]],
          zoom: 16.2,
          pitch: is3D ? 58 : 0,
          duration: 800,
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
        zoom: 16.2,
        pitch: is3D ? 58 : 0,
        duration: 800,
        essential: true
      });
    }
  }, [locations, selectedLocation, activeCardLoc, is3D, isDark]);

  // Toggle between 2D Flat Top-down and Real 3D Extruded Buildings
  const toggle3DMode = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    if (is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
      setIs3D(false);
      try {
        if (map.getLayer('3d-monuments-extrusion')) {
          map.setPaintProperty('3d-monuments-extrusion', 'fill-extrusion-opacity', 0.0);
        }
      } catch (e) {}
    } else {
      map.easeTo({ pitch: 58, bearing: -18, duration: 800 });
      setIs3D(true);
      try {
        if (map.getLayer('3d-monuments-extrusion')) {
          map.setPaintProperty('3d-monuments-extrusion', 'fill-extrusion-opacity', 0.88);
        }
      } catch (e) {}
    }
  };

  const resetBearing = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({ bearing: 0, duration: 400 });
  };

  const centerMinsk = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [27.5615, 53.9045],
      zoom: 13.5,
      pitch: is3D ? 58 : 0,
      bearing: is3D ? -18 : 0,
      duration: 700
    });
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border shadow-2xl transition-colors ${
      isDark ? 'border-neutral-800/60 bg-black' : 'border-slate-200 bg-slate-100'
    }`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Sleek Horizontal Control Capsule (Placed Horizontally as requested!) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all">
        <div className={`flex items-center gap-1 p-0.5 rounded-xl ${
          isDark ? 'bg-black/65 border border-neutral-800/80 text-white' : 'bg-white/85 border border-slate-200 text-slate-800 shadow-sm'
        }`}>
          {/* Toggle Real 3D / 2D */}
          <button
            onClick={toggle3DMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              is3D 
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-slate-900 text-white shadow-xs'
                : isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
            title={is3D ? 'Включён режим 3D. Нажмите для 2D' : 'Включить режим 3D зданий'}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{is3D ? '3D' : '2D'}</span>
          </button>

          {/* Toggle Satellite / Scheme */}
          <button
            onClick={() => setMapType(mapType === 'satellite' ? 'scheme' : 'satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapType === 'satellite'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-slate-900 text-white shadow-xs'
                : isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
            title="Переключить спутниковый снимок / схему"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapType === 'satellite' ? 'Спутник' : 'Схема'}</span>
          </button>

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

          {/* Compass */}
          <button
            onClick={resetBearing}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
            title={`Компас (поворот ${bearing}°)`}
          >
            <Compass 
              className="w-4 h-4 transition-transform duration-200" 
              style={{ transform: `rotate(${-bearing}deg)` }}
            />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
            title="Приблизить (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
            title="Отдалить (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Center Minsk */}
          <button
            onClick={centerMinsk}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
            title="Центр Минска"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frosted Glass Floating Card for Selected Location */}
      {activeCardLoc && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all ${
            isDark 
              ? 'bg-black/65 border-neutral-700/60 text-white' 
              : 'bg-white/90 border-slate-200 text-slate-900 shadow-xl'
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
                    <span className="font-semibold">{activeCardLoc.district}</span>
                    <span>•</span>
                    <span>{activeCardLoc.archiveYear}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">
                    {activeCardLoc.title}
                  </h4>
                  <p className="text-xs opacity-75 line-clamp-1 mt-0.5">
                    {activeCardLoc.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCardLoc(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200"
                aria-label="Закрыть карточку"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className={`mt-3 pt-3 border-t flex items-center gap-2 ${
              isDark ? 'border-neutral-800/60' : 'border-slate-200'
            }`}>
              <button
                onClick={() => onSelectLocation(activeCardLoc)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-slate-900 text-white hover:bg-black shadow-xs'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Сравнить эпохи</span>
              </button>

              <button
                onClick={() => onSelectLocation(activeCardLoc)}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark ? 'border-neutral-700/60 hover:bg-neutral-800/40 text-neutral-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
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
