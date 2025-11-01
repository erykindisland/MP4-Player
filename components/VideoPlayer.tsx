import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { VolumeOffIcon } from './icons/VolumeOffIcon';
import { FullScreenIcon } from './icons/FullScreenIcon';
import { ExitFullScreenIcon } from './icons/ExitFullScreenIcon';
import { UploadIcon } from './icons/UploadIcon';

interface VideoPlayerProps {
  src: string;
  fileName: string;
  onNewVideo: () => void;
}

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '0:00';
  const flooredTime = Math.floor(timeInSeconds);
  const minutes = Math.floor(flooredTime / 60);
  const seconds = flooredTime % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, fileName, onNewVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const currentlyMuted = videoRef.current.muted;
      videoRef.current.muted = !currentlyMuted;
      setIsMuted(!currentlyMuted);
      if (currentlyMuted) { // If it was muted, unmute and restore volume
        setVolume(videoRef.current.volume > 0 ? videoRef.current.volume : 0.5);
      } else { // if it was not muted, mute and set volume slider to 0
        setVolume(0);
      }
    }
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const seek = useCallback((amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  }, []);

  const adjustVolume = useCallback((amount: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + amount));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullScreen();
          break;
        case 'arrowright':
          seek(5);
          break;
        case 'arrowleft':
          seek(-5);
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullScreen, seek, adjustVolume]);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if(videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if(videoRef.current) videoRef.current.currentTime = newTime;
  };

  const hideControls = useCallback(() => {
    if (!isPlaying) return;
    setShowControls(false);
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      if (progressRef.current && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressRef.current.style.background = `linear-gradient(to right, #8b5cf6 ${progress}%, #4b5563 ${progress}%)`;
      }
    };
    const setVideoDuration = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onPause);

    handleMouseMove();

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onPause);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src, handleMouseMove]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full group bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={hideControls}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={togglePlay}
        onDoubleClick={toggleFullScreen}
        autoPlay
      />
      
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${!isPlaying && showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
        <button
          onClick={togglePlay}
          className="p-4 bg-black/50 rounded-full hover:bg-purple-600/70 transition-all duration-300 transform hover:scale-110 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Play video"
          title="Play (k)"
        >
          <PlayIcon className="w-16 h-16 text-white" />
        </button>
      </div>
      
      <div className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></div>

      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'} `}>
        <div className="flex items-center space-x-4">
          <button onClick={togglePlay} title={isPlaying ? 'Pause (k)' : 'Play (k)'} className="text-white p-2 rounded-full hover:bg-white/20 transition-all transform hover:scale-110 focus:outline-none">
            {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
          </button>
          
          <div className="text-sm font-mono w-12 text-center">{formatTime(currentTime)}</div>

          <input
            ref={progressRef}
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer range-thumb"
            style={{background: 'linear-gradient(to right, #8b5cf6 0%, #4b5563 0%)'}}
          />

          <div className="text-sm font-mono w-12 text-center">{formatTime(duration)}</div>

          <div className="flex items-center space-x-2">
            <button onClick={toggleMute} title="Mute (m)" className="text-white p-2 rounded-full hover:bg-white/20 transition-all transform hover:scale-110 focus:outline-none">
              {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer range-thumb"
            />
          </div>
          
          <button onClick={toggleFullScreen} title="Fullscreen (f)" className="text-white p-2 rounded-full hover:bg-white/20 transition-all transform hover:scale-110 focus:outline-none">
            {isFullScreen ? <ExitFullScreenIcon className="w-6 h-6" /> : <FullScreenIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
       <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'} `}>
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold truncate" title={fileName}>{fileName}</h2>
                <button 
                  onClick={onNewVideo}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none transform hover:scale-105"
                  title="Load a new video"
                  >
                  <UploadIcon className="w-5 h-5" />
                  <span>New Video</span>
                </button>
            </div>
        </div>
    </div>
  );
};

// Add some CSS to style the range input's thumb for a better look
const style = document.createElement('style');
style.textContent = `
  .range-thumb::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #a78bfa;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease-in-out;
    border: 2px solid #111827;
  }

  .range-thumb::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #a78bfa;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid #111827;
    transition: all 0.2s ease-in-out;
  }
  
  .range-thumb:hover::-webkit-slider-thumb {
    background: #8b5cf6;
    transform: scale(1.1);
  }
  .range-thumb:hover::-moz-range-thumb {
    background: #8b5cf6;
    transform: scale(1.1);
  }
`;
if (!document.head.querySelector('#custom-range-styles')) {
  style.id = 'custom-range-styles';
  document.head.appendChild(style);
}
