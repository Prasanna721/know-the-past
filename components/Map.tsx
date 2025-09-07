import React, { useRef, useEffect, useState } from 'react';

// FIX: Add google to the window object to avoid TypeScript errors when the Google Maps script is loaded externally.
declare global {
  interface Window {
    google: any;
  }
}

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markerPosition: { lat: number; lng: number } | null;
}

const mapStyles: any[] = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
];

const MissingApiKeyMessage: React.FC = () => (
  <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10">
    <div className="max-w-md bg-gray-800 p-6 rounded-lg shadow-2xl ring-1 ring-red-500/50">
      <h2 className="text-2xl font-bold text-red-400 mb-3">Google Maps API Error</h2>
      <p className="text-gray-300">
        The map failed to load, likely due to an invalid API key.
      </p>
      <div className="mt-4 text-sm text-gray-300 bg-gray-900/70 px-3 py-2 rounded-md border border-gray-700">
        Please open the <code className="font-mono text-amber-300">index.html</code> file and replace
        <br />
        <code className="font-mono text-amber-300 my-1 inline-block">'YOUR_GOOGLE_MAPS_API_KEY'</code>
        <br />
        with a valid key.
      </div>
      <a
        href="https://developers.google.com/maps/documentation/javascript/get-api-key"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 underline transition-colors"
      >
        Learn how to get an API Key &rarr;
      </a>
    </div>
  </div>
);


const MapComponent: React.FC<MapProps> = ({ center, zoom, markerPosition }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any | null>(null);
    const markerRef = useRef<any | null>(null);
    const [isApiLoaded, setIsApiLoaded] = useState(false);

    // Check for Google Maps API script on component mount.
    // If window.google is not available, the API key is likely invalid or missing.
    useEffect(() => {
        if (window.google && window.google.maps) {
            setIsApiLoaded(true);
        }
    }, []);

    // Initialize map once API is loaded
    useEffect(() => {
        if (isApiLoaded && mapRef.current && !map) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center,
                zoom,
                mapId: 'KNOW_THE_PAST_MAP_DARK',
                disableDefaultUI: true,
                styles: mapStyles,
            });
            setMap(newMap);
        }
    }, [isApiLoaded, map, center, zoom]);

    // Update map view (pan/zoom) when props change
    useEffect(() => {
        if (map) {
            map.panTo(center);
            map.setZoom(zoom);
        }
    }, [map, center, zoom]);

    // Update marker when position changes
    useEffect(() => {
        if (map && window.google?.maps?.marker) {
            // Clear previous marker
            if (markerRef.current) {
                markerRef.current.map = null;
            }
            // Add new marker if a position is provided
            if (markerPosition) {
                markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: markerPosition,
                });
            }
        }
    }, [map, markerPosition]);

    return (
        <div className="relative w-full h-full">
            {!isApiLoaded && <MissingApiKeyMessage />}
            <div ref={mapRef} className={`w-full h-full transition-opacity duration-300 ${isApiLoaded ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
};

export const Map = React.memo(MapComponent);