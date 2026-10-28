import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Box, 
  Compass, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  MapPin, 
  ArrowUpRight,
  Split,
  Calendar
} from 'lucide-react';

export const InteractiveMap = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [is3D, setIs3D] = useState(true);
  const [bearing, setBearing] = useState(-20);
  const [pitch, setPitch] = useState(55);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of Minsk: [lng, lat]
    const minskCenter = [27.5615, 53.9045];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri World Imagery 3D'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: minskCenter,
      zoom: 13.8,
      minZoom: 10,
      maxZoom: 19,
      pitch: 55, // 3D tilt perspective like Yandex Maps
      bearing: -20, // 3D rotation angle
      maxPitch: 80,
      attributionControl: false,
    });

    map.on('rotate', () => setBearing(Math.round(map.getBearing())));
    map.on('pitch', () => setPitch(Math.round(map.getPitch())));

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;

      // Custom 3D SVG marker pin
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer select-none';
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
          isSelected
            ? 'bg-white text-black ring-4 ring-white/40 scale-125 z-50 shadow-2xl'
            : 'bg-black/90 text-white hover:bg-neutral-900 hover:scale-110 shadow-xl border border-neutral-700 hover:border-white'
        }">
          <svg class="w-4 h-4 ${isSelected ? 'text-black' : 'text-neutral-200'}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <div class="bg-black text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap border border-neutral-800 backdrop-blur-md">
            ${loc.title}
          </div>
          <div class="w-2 h-2 bg-black border-r border-b border-neutral-800 rotate-45 -mt-1"></div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectLocation(loc);
        map.flyTo({
          center: [loc.coords[1], loc.coords[0]],
          zoom: 16.5,
          pitch: 62,
          bearing: -15,
          duration: 1400,
          essential: true
        });
      });

      // MapLibre takes [lng, lat]
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.coords[1], loc.coords[0]])
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (selectedLocation) {
      map.flyTo({
        center: [selectedLocation.coords[1], selectedLocation.coords[0]],
        zoom: 16.5,
        pitch: 62,
        bearing: -15,
        duration: 1200,
        essential: true
      });
    }
  }, [locations, selectedLocation, onSelectLocation]);

  const toggle3DMode = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (is3D) {
      map.easeTo({ pitch: 0, duration: 800 });
      setIs3D(false);
    } else {
      map.easeTo({ pitch: 58, bearing: -20, duration: 800 });
      setIs3D(true);
    }
  };

  const resetBearing = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({ bearing: 0, duration: 600 });
  };

  const centerMinsk = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [27.5615, 53.9045],
      zoom: 13.8,
      pitch: is3D ? 55 : 0,
      bearing: -20,
      duration: 1000
    });
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-neutral-850 shadow-2xl bg-black">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Left Status Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 shadow-xl flex items-center gap-2 text-xs font-medium text-neutral-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[11px] text-neutral-300">Спутник 3D · Реалистичный режим</span>
        </div>
      </div>

      {/* Top Right 3D Controls (Like Yandex Maps 3D) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-800 shadow-2xl">
        {/* Toggle 3D / 2D */}
        <button
          onClick={toggle3DMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            is3D 
              ? 'bg-white text-black shadow-md' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
          title="Переключить 3D перспективу"
        >
          <Box className="w-3.5 h-3.5" />
          <span>{is3D ? '3D Активен' : '2D Режим'}</span>
        </button>

        {/* Compass / Reset Rotation */}
        <button
          onClick={resetBearing}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center justify-center transition-colors"
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
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center justify-center transition-colors"
          title="Приблизить"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center justify-center transition-colors"
          title="Отдалить"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Center */}
        <button
          onClick={centerMinsk}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center justify-center transition-colors border-t border-neutral-800"
          title="Центрировать карту"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-400 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span className="text-neutral-200">10 архивных локаций</span>
        </div>
        <span>•</span>
        <span>Зажмите правую кнопку мыши для свободного 3D-вращения</span>
      </div>
    </div>
  );
};
