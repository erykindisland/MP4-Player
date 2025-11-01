import React, { useState, useCallback } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { UploadIcon } from './components/icons/UploadIcon';

const App: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (file && file.type === 'video/mp4') {
      const url = URL.createObjectURL(file);
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
      setVideoSrc(url);
      setFileName(file.name);
    } else {
      alert('Please select a valid MP4 file.');
    }
  }, [videoSrc]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);
  
  const handleNewVideo = () => {
      if(videoSrc) {
          URL.revokeObjectURL(videoSrc);
      }
      setVideoSrc(null);
      setFileName('');
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <main className="bg-transparent text-white min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-5xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animated-gradient-text">
            MP4 Player Pro
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Watch your local MP4 files with ease and style.</p>
        </header>
        
        <div className="bg-black rounded-xl shadow-2xl shadow-purple-500/30 overflow-hidden ring-1 ring-white/10">
          {videoSrc ? (
            <VideoPlayer src={videoSrc} fileName={fileName} onNewVideo={handleNewVideo} />
          ) : (
            <div 
              className={`aspect-video w-full flex flex-col items-center justify-center p-8 transition-all duration-300 ${isDragging ? 'bg-purple-500/10' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label htmlFor="video-upload" className="cursor-pointer group flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-2xl p-10 transition-all duration-300 w-full h-full">
                <div className={`w-24 h-24 rounded-full bg-gray-800 group-hover:bg-purple-600 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${isDragging ? 'scale-110 bg-purple-600' : ''}`}>
                  <UploadIcon className={`w-12 h-12 text-gray-500 group-hover:text-white transition-colors ${isDragging ? 'text-white' : ''}`} />
                </div>
                <p className="mt-4 text-lg text-gray-300 group-hover:text-white transition-colors">
                  {isDragging ? "Drop the file here!" : "Select an MP4 file or drag & drop"}
                </p>
              </label>
              <input
                id="video-upload"
                type="file"
                accept=".mp4"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default App;