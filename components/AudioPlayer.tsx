import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from './Icons';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);

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
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  return (
    <div className="flex items-center space-x-3 bg-gray-700/50 p-2 rounded-lg">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className="p-2 bg-indigo-500 rounded-full text-white flex-shrink-0">
        {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
      </button>
      <div className="flex-1 h-1.5 bg-gray-600 rounded-full">
         <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="text-xs font-mono text-gray-400">{duration}</span>
    </div>
  );
};

export default AudioPlayer;
