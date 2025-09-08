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

            if (imageCache.has(prompt)) {
                if (isMounted) {
                    setImageUrl(imageCache.get(prompt)!);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            setImageUrl(null);

            try {
                const base64ImageBytes = await generateImageFromPrompt(prompt);
                const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                
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
        <div className="aspect-video bg-gray-800 w-full flex items-center justify-center overflow-hidden">
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
        imageCache.clear();
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
            className={`w-full rounded-xl shadow-2xl transition-all duration-300 ease-in-out
            ${isMinimized 
                ? 'max-w-md bg-gray-900/70 backdrop-blur-md cursor-pointer hover:bg-gray-900/80' 
                : 'max-w-xl bg-transparent'
            }`}
            onClick={handlePanelClick}
            aria-expanded={!isMinimized}
        >
            <div className={`relative transition-all duration-300 ease-in-out ${isMinimized ? 'h-20 overflow-hidden' : ''}`}>
                {isMinimized && (
                    <div className="p-6 flex items-center h-full">
                        {isLoading ? (
                            <LoadingCard message="Retrieving" />
                        ) : (
                             <h2 className="text-md font-medium text-white/80">Immersive View</h2>
                        )}
                    </div>
                )}
                
                {!isMinimized && (
                    <div className="animate-fade-in">
                        {isLoading && (
                            <div className="aspect-video w-full flex items-center justify-center bg-gray-800 rounded-xl">
                                <LoadingCard message="Creating visual story" />
                            </div>
                        )}
                        {error && <div className="aspect-video w-full flex items-center justify-center bg-gray-800/80 rounded-xl p-4"><p className="text-center text-red-400">{error}</p></div>}
                        
                        {!isLoading && !error && slides.length > 0 && (
                            <div className="relative w-full rounded-xl overflow-hidden bg-gray-800">
                                <ImageWithLoader prompt={slides[currentSlide].image_prompt} />
                                
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 text-white">
                                    <div className="flex justify-between items-end gap-4 mb-2">
                                        <h3 className="text-2xl font-bold leading-tight">{slides[currentSlide].title}</h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={prevSlide} aria-label="Previous slide" className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors">
                                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                                            </button>
                                            <span className="text-sm text-gray-300 font-mono w-12 text-center">{currentSlide + 1}/{slides.length}</span>
                                            <button onClick={nextSlide} aria-label="Next slide" className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-300 text-base mb-3">{slides[currentSlide].subtitle}</p>
                                    
                                    <ul className="space-y-1.5 border-t border-white/20 pt-3">
                                        {slides[currentSlide].key_points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <svg className="w-4 h-4 mt-[3px] flex-shrink-0 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                                <span className="text-gray-300 text-sm leading-snug">{point}</span>
                                            </li>
                                        ))}
                                   </ul>
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && slides.length === 0 && place && (
                            <div className="aspect-video w-full flex items-center justify-center bg-gray-800 rounded-xl">
                                <p className="text-center text-gray-400 p-4">No visual content could be generated for this place.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};