
import React, { useState, useCallback } from 'react';
import { Map } from './components/Map';
import { Dock } from './components/Dock';
import { InfoPanel } from './components/InfoPanel';
import { fetchHistoricalPlace } from './services/geminiService';
import type { HistoricalPlace } from './types';

const INITIAL_CENTER = { lat: 40.7831, lng: -73.9712 }; // Centered on Manhattan
const INITIAL_ZOOM = 11; // Zoomed in on Manhattan

const LoadingSpinner: React.FC = () => (
  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
    <p className="mt-4 text-lg font-semibold text-white">Discovering a place for you...</p>
  </div>
);

const App: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<HistoricalPlace | null>(null);

    const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
    const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);

    const handleCategorySelect = useCallback(async (category: string) => {
        setLoading(true);
        setError(null);
        setSelectedPlace(null);
        
        try {
            const place = await fetchHistoricalPlace(category);
            setSelectedPlace(place);
            setMapCenter({ lat: place.latitude, lng: place.longitude });
            setMapZoom(place.zoom_level);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to find a place. ${errorMessage}`);
            // Reset map to initial state on error
            setMapCenter(INITIAL_CENTER);
            setMapZoom(INITIAL_ZOOM);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const handleClosePanel = useCallback(() => {
        setSelectedPlace(null);
    }, []);

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            {loading && <LoadingSpinner />}

            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white p-3 rounded-lg shadow-lg z-40">
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white font-bold">&times;</button>
                </div>
            )}
            
            <Map 
              center={mapCenter} 
              zoom={mapZoom} 
              markerPosition={selectedPlace ? { lat: selectedPlace.latitude, lng: selectedPlace.longitude } : null}
            />

            <InfoPanel place={selectedPlace} onClose={handleClosePanel} />
            
            <Dock onCategorySelect={handleCategorySelect} isLoading={loading} />
        </div>
    );
};

export default App;
