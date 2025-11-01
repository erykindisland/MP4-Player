
import React, { useState, useCallback } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { UploadIcon } from './components/icons/UploadIcon';

const App: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setFileName(file.name);
    } else {
      alert('Please select a valid MP4 file.');
    }
  }, []);
  
  const handleNewVideo = () => {
      if(videoSrc) {
          URL.revokeObjectURL(videoSrc);
      }
      setVideoSrc(null);
      setFileName('');
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-5xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            MP4 Player Pro
          </h1>
          <p className="text-gray-400 mt-2">Watch your local MP4 files with ease.</p>
        </header>
        
        <div className="bg-black rounded-lg shadow-2xl shadow-purple-500/20 overflow-hidden">
          {videoSrc ? (
            <VideoPlayer src={videoSrc} fileName={fileName} onNewVideo={handleNewVideo} />
          ) : (
            <div className="aspect-video w-full flex flex-col items-center justify-center p-8">
              <label htmlFor="video-upload" className="cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-gray-800 group-hover:bg-purple-600 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                  <UploadIcon className="w-12 h-12 text-gray-500 group-hover:text-white" />
                </div>
                <p className="mt-4 text-lg text-gray-300 group-hover:text-white transition-colors">Select an MP4 file</p>
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
