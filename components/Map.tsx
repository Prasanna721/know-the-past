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

const MapComponent: React.FC<MapProps> = ({ center, zoom, markerPosition }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any | null>(null);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
    const markerRef = useRef<any | null>(null);

    // Initialize map and update its view
    useEffect(() => {
        // Ensure the Google Maps API is loaded and the map container is available
        if (mapRef.current && window.google && window.google.maps) {
            if (!map) {
                // Create a new map instance if it doesn't exist
                const newMap = new window.google.maps.Map(mapRef.current, {
                    center,
                    zoom,
                    mapId: 'KNOW_THE_PAST_MAP_DARK',
                    disableDefaultUI: true,
                    styles: mapStyles,
                });
                setMap(newMap);
            } else {
                // If map already exists, just update its center and zoom
                map.panTo(center);
                map.setZoom(zoom);
            }
        }
    }, [map, center, zoom]);

    // Update map type based on user selection
    useEffect(() => {
        if (map) {
            if (mapType === 'satellite') {
                map.setMapTypeId('satellite');
                map.setOptions({ styles: null }); // Remove custom styles for satellite view
                map.setTilt(45); // Enable 3D view
            } else { // 'roadmap'
                map.setMapTypeId('roadmap');
                map.setOptions({ styles: mapStyles }); // Re-apply custom styles
                map.setTilt(0); // Disable tilt for 2D view
            }
        }
    }, [map, mapType]);

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

    const toggleMapType = () => {
        setMapType(prev => (prev === 'roadmap' ? 'satellite' : 'roadmap'));
    };

    const CubeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
    );
    
    const MapIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25l-4.5-2.25v-10.5L9 9.75l4.5 2.25L18 9.75v10.5l-4.5 2.25L9 20.25ZM9 4.5l4.5 2.25l4.5-2.25M9 4.5L4.5 6.75L9 9.75l4.5-2.25L9 4.5Z" />
        </svg>
    );

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full" />
            <div className="absolute bottom-6 left-6 z-10">
                <button
                    onClick={toggleMapType}
                    className="w-12 h-12 flex items-center justify-center rounded-full text-white bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label={`Switch to ${mapType === 'roadmap' ? 'Satellite (3D)' : 'Terrain'} view`}
                    title={`Switch to ${mapType === 'roadmap' ? 'Satellite (3D)' : 'Terrain'} view`}
                >
                    {mapType === 'roadmap' ? <CubeIcon /> : <MapIcon />}
                </button>
            </div>
        </div>
    );
};

export const Map = React.memo(MapComponent);