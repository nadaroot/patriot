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

    // Build solid inline style using 100% reliable, keyless Esri raster tiles
    const inlineStyle = {
      version: 8,
      sources: {
        'esri-scheme': {
          type: 'raster',
          tiles: [
            isDark
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
              : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Esri'
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
          id: 'scheme-layer',
          type: 'raster',
          source: 'esri-scheme',
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
          'fill-extrusion-color': isDark ? '#52525b' : '#a89d89',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': is3D ? 0.85 : 0.0,
          'fill-extrusion-vertical-gradient': true
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
    if (map.getLayer('scheme-layer') && map.getLayer('satellite-layer')) {
      map.setLayoutProperty('scheme-layer', 'visibility', mapType === 'satellite' ? 'none' : 'visible');
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
        ? (isDark ? '#000000' : '#fef3c7')
        : (isDark ? '#ffffff' : '#f8f5ee');

      const pinCore = isSelected
        ? (isDark ? '#000000' : '#ffffff')
        : (isDark ? '#ffffff' : '#f8f5ee');

      el.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center pointer-events-auto">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="group-hover:scale-115 transition-transform duration-200" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.38));">
            <path d="M16 1C7.716 1 1 7.716 1 16C1 26.5 16 41 16 41C16 41 31 26.5 31 16C31 7.716 24.284 1 16 1Z" 
                  fill="${pinFill}" 
                  stroke="${pinStroke}" 
                  stroke-width="2" 
                  stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="5" fill="${pinCore}"/>
          </svg>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="${isDark ? 'bg-black/85 text-white border-neutral-700/60' : 'bg-[#fbf9f4]/95 text-[#2c261e] border-[#e5dcce] shadow-xl'} text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-2xl whitespace-nowrap border backdrop-blur-xl">
              ${loc.title}
            </div>
            <div class="w-1.5 h-1.5 ${isDark ? 'bg-black/85 border-neutral-700/60' : 'bg-[#fbf9f4]/95 border-[#e5dcce]'} border-r border-b rotate-45 -mt-1"></div>
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
      isDark ? 'border-neutral-800/60 bg-black' : 'border-[#e5dcce] bg-[#efe8dc]'
    }`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Sleek Horizontal Control Capsule */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all">
        <div className={`flex items-center gap-1 p-0.5 rounded-xl ${
          isDark ? 'bg-black/65 border border-neutral-800/80 text-white' : 'bg-[#fbf9f4]/90 border border-[#e5dcce] text-[#2c261e] shadow-sm'
        }`}>
          {/* Toggle Real 3D / 2D */}
          <button
            onClick={toggle3DMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              is3D 
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#2c261e] text-[#fbf9f4] shadow-xs'
                : isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
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
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#2c261e] text-[#fbf9f4] shadow-xs'
                : isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
            }`}
            title="Переключить спутниковый снимок / схему"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapType === 'satellite' ? 'Спутник' : 'Схема'}</span>
          </button>

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-neutral-800' : 'bg-[#e5dcce]'}`} />

          {/* Compass */}
          <button
            onClick={resetBearing}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
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

          {/* Center Minsk */}
          <button
            onClick={centerMinsk}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50' : 'text-[#635747] hover:text-[#1a1612] hover:bg-[#efe8dc]'
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
              ? 'bg-black/75 border-neutral-700/60 text-white' 
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
                    <span className="font-semibold">{activeCardLoc.district}</span>
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
