import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Box, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Layers
} from 'lucide-react';

export const InteractiveMap = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [is3D, setIs3D] = useState(false); // Default is clean 2D top-down view
  const [bearing, setBearing] = useState(0);

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
            attribution: 'Esri World Imagery'
          },
          'openfreemap-vector': {
            type: 'vector',
            url: 'https://tiles.openfreemap.org/planet'
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
      zoom: 13.5,
      minZoom: 10,
      maxZoom: 19,
      pitch: 0, // Clean 2D flat top-down by default
      bearing: 0,
      maxPitch: 80,
      attributionControl: false,
    });

    map.on('rotate', () => setBearing(Math.round(map.getBearing())));

    map.on('load', () => {
      // Add Real 3D building extrusions layer from vector tiles
      try {
        if (!map.getLayer('3d-buildings')) {
          map.addLayer({
            id: '3d-buildings',
            source: 'openfreemap-vector',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13.5,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], 15],
                0, 'rgba(25, 25, 25, 0.85)',
                30, 'rgba(45, 45, 45, 0.9)',
                80, 'rgba(80, 80, 80, 0.95)'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13.5, 0,
                14, ['coalesce', ['get', 'render_height'], 15]
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13.5, 0,
                14, ['coalesce', ['get', 'render_min_height'], 0]
              ],
              'fill-extrusion-opacity': 0.0 // hidden by default in 2D
            }
          });
        }
      } catch (e) {
        console.warn('3D building layer init:', e);
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
            'circle-radius': 12,
            'circle-color': '#ffffff',
            'circle-opacity': 0.25,
            'circle-pitch-alignment': 'map' // Locked flat to the ground plane!
          }
        });

        map.addLayer({
          id: 'location-dots',
          type: 'circle',
          source: 'locations-points',
          paint: {
            'circle-radius': 4.5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#000000',
            'circle-pitch-alignment': 'map' // Locked flat to the ground plane!
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
      const isSelected = selectedLocation?.id === loc.id;

      // Pin DOM container with explicit fixed dimensions
      const el = document.createElement('div');
      el.className = 'cursor-pointer select-none';
      el.style.width = '28px';
      el.style.height = '36px';

      // SVG teardrop pin pointing strictly at bottom center (14, 36)
      el.innerHTML = `
        <div class="relative w-full h-full group">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none" class="transition-transform duration-150">
            <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" 
                  fill="${isSelected ? '#ffffff' : '#0a0a0a'}" 
                  stroke="${isSelected ? '#000000' : '#ffffff'}" 
                  stroke-width="1.8"/>
            <circle cx="14" cy="13" r="5" fill="${isSelected ? '#000000' : '#ffffff'}"/>
          </svg>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="bg-black/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-2xl whitespace-nowrap border border-neutral-700/80 backdrop-blur-md">
              ${loc.title}
            </div>
            <div class="w-1.5 h-1.5 bg-black/90 border-r border-b border-neutral-700/80 rotate-45 -mt-1"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectLocation(loc);
        map.flyTo({
          center: [loc.coords[1], loc.coords[0]],
          zoom: 16.2,
          pitch: is3D ? 58 : 0,
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
      map.flyTo({
        center: [selectedLocation.coords[1], selectedLocation.coords[0]],
        zoom: 16.2,
        pitch: is3D ? 58 : 0,
        duration: 900,
        essential: true
      });
    }
  }, [locations, selectedLocation, is3D, onSelectLocation]);

  // Toggle between 2D Top-down and Real 3D Extruded Buildings
  const toggle3DMode = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    if (is3D) {
      // Switch back to 2D
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      setIs3D(false);
      try {
        if (map.getLayer('3d-buildings')) {
          map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', 0.0);
        }
      } catch (e) {}
    } else {
      // Activate Real 3D Extrusions + Tilt
      map.easeTo({ pitch: 58, bearing: -18, duration: 900 });
      setIs3D(true);
      try {
        if (map.getLayer('3d-buildings')) {
          map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', 0.88);
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
      zoom: 13.5,
      pitch: is3D ? 58 : 0,
      bearing: is3D ? -18 : 0,
      duration: 800
    });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-neutral-800/60 shadow-2xl bg-black">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Compact Translucent Controls with Clear Tooltips */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-black/60 backdrop-blur-xl p-1.5 rounded-2xl border border-neutral-800/70 shadow-2xl">
        
        {/* Toggle Real 3D / 2D */}
        <button
          onClick={toggle3DMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            is3D 
              ? 'bg-white text-black shadow-md' 
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
          }`}
          title={is3D ? 'Включён режим 3D зданий. Нажмите для 2D' : 'Включить реальные 3D здания'}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{is3D ? '3D Здания' : '2D Карта'}</span>
        </button>

        {/* Compass / Reset Rotation */}
        <button
          onClick={resetBearing}
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex items-center justify-center transition-colors"
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
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex items-center justify-center transition-colors"
          title="Приблизить карту (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex items-center justify-center transition-colors"
          title="Отдалить карту (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Center Minsk */}
        <button
          onClick={centerMinsk}
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex items-center justify-center transition-colors border-t border-neutral-800/60"
          title="Центрировать на историческом центре Минска"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
