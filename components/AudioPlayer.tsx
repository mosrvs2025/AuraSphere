import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PlayIcon, PauseIcon } from './Icons';

interface AudioPlayerProps {
  src: string;
}

// Helper to generate a consistent, fake waveform from a string (URL)
// This ensures the same audio file always gets the same visual representation
const generateWaveformData = (seed: string, numBars: number = 30): number[] => {
    let hash = 0;
    if (seed.length === 0) return Array(numBars).fill(0.1);
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    const pseudoRandom = () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    };

    const data = [];
    for (let i = 0; i < numBars; i++) {
        data.push(Math.max(0.15, pseudoRandom())); // Min height of 15%
    }
    return data;
};


const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformData = useMemo(() => generateWaveformData(src, 40), [src]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    const setAudioDuration = () => {
        if(audio.duration && isFinite(audio.duration)) {
             const minutes = Math.floor(audio.duration / 60);
             const seconds = Math.floor(audio.duration % 60);
             setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
      }
    }
  };
  
  return (
    <div className="flex items-center space-x-3 bg-gray-700/50 p-2 rounded-lg">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button 
        onClick={togglePlay} 
        className="p-2 bg-indigo-500 rounded-full text-white flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
      </button>
       <div className="flex-1 h-8 flex items-center space-x-0.5">
          {waveformData.map((height, i) => {
              const isPlayed = (progress / 100) * waveformData.length > i;
              return (
                  <div
                      key={i}
                      className="w-1 rounded-full transition-colors duration-75"
                      style={{
                          height: `${height * 90}%`,
                          backgroundColor: isPlayed ? '#818cf8' : '#4b5563', // indigo-400 : gray-600
                      }}
                  />
              );
          })}
      </div>
      <span className="text-xs font-mono text-gray-400">{duration}</span>
    </div>
  );
};

export default AudioPlayer;