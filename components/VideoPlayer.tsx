
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
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if(videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if(!isMuted) {
          setVolume(0);
      } else {
          setVolume(videoRef.current.volume || 0.5);
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if(videoRef.current) videoRef.current.currentTime = newTime;
  };
  
  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const hideControls = () => {
    if (!isPlaying) return;
    setShowControls(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      if (progressRef.current) {
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
  }, []);

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
      className="relative aspect-video w-full group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if(isPlaying) setShowControls(false) }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={togglePlay}
      />
      
      <div className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></div>

      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'} `}>
        <div className="flex items-center space-x-4">
          <button onClick={togglePlay} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none">
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          
          <div className="text-sm font-mono">{formatTime(currentTime)}</div>

          <input
            ref={progressRef}
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer range-thumb"
            style={{background: 'linear-gradient(to right, #8b5cf6 0%, #4b5563 0%)'}}
          />

          <div className="text-sm font-mono">{formatTime(duration)}</div>

          <div className="flex items-center space-x-2">
            <button onClick={toggleMute} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none">
              {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer range-thumb"
            />
          </div>
          
          <button onClick={toggleFullScreen} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none">
            {isFullScreen ? <ExitFullScreenIcon className="w-6 h-6" /> : <FullScreenIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
       <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'} `}>
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold truncate" title={fileName}>{fileName}</h2>
                <button 
                  onClick={onNewVideo}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none"
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
    width: 14px;
    height: 14px;
    background: #a78bfa;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.3s;
  }

  .range-thumb::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #a78bfa;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    transition: background 0.3s;
  }
  
  .range-thumb:hover::-webkit-slider-thumb {
    background: #8b5cf6;
  }
  .range-thumb:hover::-moz-range-thumb {
    background: #8b5cf6;
  }
`;
document.head.appendChild(style);
