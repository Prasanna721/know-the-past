import React, { useState, useEffect, useCallback } from 'react';
import type { HistoricalPlace, Slide } from '../types';
import { fetchVisualSlides, generateImageFromPrompt } from '../services/geminiService';

interface VisualContentCardProps {
    place: HistoricalPlace | null;
    isExpanded: boolean;
    onToggle: () => void;
}

// In-memory cache for generated images.
// It persists across re-renders because it's defined outside the component.
const imageCache = new Map<string, string>();

const LoadingCard: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full p-6 text-gray-300">
        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mr-3"></div>
        <span>{message}...</span>
    </div>
);

const ImageWithLoader: React.FC<{ prompt: string }> = ({ prompt }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const generateImage = async () => {
            setError(null);

            // 1. Check cache first
            if (imageCache.has(prompt)) {
                if (isMounted) {
                    setImageUrl(imageCache.get(prompt)!);
                    setIsLoading(false);
                }
                return;
            }

            // 2. If not in cache, show loader and generate
            setIsLoading(true);
            setImageUrl(null); // Clear previous image

            try {
                const base64ImageBytes = await generateImageFromPrompt(prompt);
                const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                
                // 3. Store in cache
                imageCache.set(prompt, generatedUrl);

                if (isMounted) {
                    setImageUrl(generatedUrl);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Image failed to load.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (prompt) {
            generateImage();
        }

        return () => { isMounted = false; };
    }, [prompt]);

    return (
        <div className="aspect-video bg-gray-800 rounded-lg w-full flex items-center justify-center overflow-hidden">
            {isLoading && <LoadingCard message="Generating" />}
            {error && <p className="text-red-400">{error}</p>}
            {imageUrl && !isLoading && <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />}
        </div>
    );
};


export const VisualContentCard: React.FC<VisualContentCardProps> = ({ place, isExpanded, onToggle }) => {
    const isMinimized = !isExpanded;

    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const loadVisualContent = useCallback(async (currentPlace: HistoricalPlace) => {
        setIsLoading(true);
        setError(null);
        setSlides([]);
        setCurrentSlide(0);
        imageCache.clear(); // Clear cache for the new place
        try {
            const fetchedSlides = await fetchVisualSlides(currentPlace);
            setSlides(fetchedSlides);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (place) {
            loadVisualContent(place);
        } else {
            setSlides([]);
            setError(null);
            setIsLoading(false);
        }
    }, [place, loadVisualContent]);
    
    const handlePanelClick = () => {
        if (isMinimized) {
            onToggle();
        }
    };
    
    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide(s => (s + 1) % slides.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide(s => (s - 1 + slides.length) % slides.length);
    };

    return (
        <div 
            className={`w-full rounded-xl bg-gray-900/70 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out
            ${isMinimized ? 'max-w-md cursor-pointer hover:bg-gray-900/80' : 'max-w-xl cursor-default'}`}
            onClick={handlePanelClick}
            aria-expanded={!isMinimized}
        >
            <div className={`relative transition-all duration-300 ease-in-out custom-scrollbar
                ${isMinimized ? 'h-20 overflow-hidden' : 'max-h-[calc(100vh-10rem)] overflow-y-auto'}`}
            >
                {isMinimized && (
                    <div className="p-6 flex items-center h-full">
                        {isLoading ? (
                            <LoadingCard message="Retrieving" />
                        ) : (
                             <h2 className="text-xl font-medium text-white/80">Visuals</h2>
                        )}
                    </div>
                )}
                
                {!isMinimized && (
                    <div className="p-6">
                        {isLoading && <LoadingCard message="Creating visual story" />}
                        {error && <p className="text-center text-red-400 p-4">{error}</p>}
                        
                        {!isLoading && !error && slides.length > 0 && (
                            <div className="space-y-4">
                               <ImageWithLoader prompt={slides[currentSlide].image_prompt} />
                               
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-white">{slides[currentSlide].title}</h3>
                                     <div className="flex items-center gap-2">
                                        <button onClick={prevSlide} aria-label="Previous slide" className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                                        </button>
                                        <span className="text-sm text-gray-400">{currentSlide + 1} / {slides.length}</span>
                                        <button onClick={nextSlide} aria-label="Next slide" className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                        </button>
                                    </div>
                                </div>
                               
                               <p className="text-gray-300">{slides[currentSlide].subtitle}</p>
                               <ul className="space-y-2 pt-2">
                                    {slides[currentSlide].key_points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <svg className="w-4 h-4 mt-1 flex-shrink-0 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                            <span className="text-gray-300">{point}</span>
                                        </li>
                                    ))}
                               </ul>
                            </div>
                        )}
                         {!isLoading && !error && slides.length === 0 && place && (
                            <p className="text-center text-gray-400 p-4">No visual content could be generated for this place.</p>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};
