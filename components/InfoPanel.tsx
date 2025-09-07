
import React from 'react';
import type { HistoricalPlace } from '../types';

interface InfoPanelProps {
    place: HistoricalPlace | null;
    onClose: () => void;
}

const DetailItem: React.FC<{ icon: JSX.Element; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 text-indigo-300 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-400">{label}</p>
            <p className="text-base text-gray-200">{value}</p>
        </div>
    </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ place, onClose }) => {
    const isVisible = !!place;

    const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.916 17.916 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
    const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
    const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
    
    return (
        <div className={`fixed top-0 left-0 h-full w-full sm:w-96 md:w-[420px] bg-gray-900/70 backdrop-blur-md shadow-2xl z-40 transform transition-transform duration-500 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50" aria-label="Close panel">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {place && (
                <div className="h-full overflow-y-auto custom-scrollbar p-6 pt-16">
                    <h2 className="text-3xl font-bold text-white mb-1">{place.name}</h2>
                    <p className="text-lg text-indigo-300 font-medium mb-4">{place.visualImpact}</p>
                    
                    <p className="text-gray-300 leading-relaxed mb-6">{place.description}</p>

                    <div className="space-y-5 border-t border-gray-700 pt-6">
                        <DetailItem icon={<GlobeIcon />} label="Country" value={place.country} />
                        <DetailItem icon={<CalendarIcon />} label="Historical Period" value={place.historicalPeriod} />
                        <DetailItem icon={<SparklesIcon />} label="Significance" value={place.significance} />
                    </div>

                    <div className="mt-6 border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-semibold text-white mb-3">Additional Context</h3>
                        <p className="text-gray-300 leading-relaxed">{place.historicalContext}</p>
                    </div>

                     <div className="mt-6 border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-semibold text-white mb-3">Best Time to Visit</h3>
                        <p className="text-gray-300 leading-relaxed">{place.bestViewingTime}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
