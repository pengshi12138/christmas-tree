
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Experience from './components/Experience';
import GestureController from './components/GestureController';
import { TreeColors, HandGesture } from './types';

const BackgroundSlideshow: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000); 
    return () => clearInterval(timer);
  }, [images]);

  const displayImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=2070&auto=format&fit=crop"];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      <div className="absolute inset-0" style={{ 
        background: 'radial-gradient(circle at 50% 50%, #03150d 0%, #010a05 40%, #000000 100%)' 
      }} />
      {displayImages.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[4000ms] ease-in-out"
          style={{
            opacity: i === index ? 0.2 : 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px) saturate(1.5)',
            transform: i === index ? 'scale(1.2)' : 'scale(1.0)',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
    </div>
  );
};

const CinematicHeader: React.FC = () => {
    return (
        <div className="absolute top-[8%] left-0 w-full flex flex-col items-center justify-center pointer-events-none z-10 select-none">
            {/* 极细副标题 */}
            <div className="flex items-center gap-3 opacity-60 mb-1 animate-pulse">
                <span className="h-[1px] w-6 md:w-12 bg-white/30" />
                <span className="font-luxury text-[9px] md:text-[11px] tracking-[0.8em] text-[#d4af37] uppercase">
                    Unwrap The Memories
                </span>
                <span className="h-[1px] w-6 md:w-12 bg-white/30" />
            </div>

            {/* 主艺术标题容器 */}
            <div className="relative flex flex-col items-center group animate-soft-float">
                {/* 衬线底色层 - 增加厚重感 */}
                <h2 className="font-luxury text-4xl md:text-6xl text-white/5 tracking-[0.4em] absolute -top-4 md:-top-6">
                    CLASSIC
                </h2>
                
                {/* 灵动主文字 - 双层叠加产生辉光效果 */}
                <div className="relative">
                    <h1 className="font-script text-7xl md:text-[9.5rem] text-[#d4af37]/20 blur-lg absolute inset-0 text-center">
                        Merry Christmas
                    </h1>
                    <h1 className="relative font-script text-7xl md:text-[9.5rem] text-center luxury-text-effect drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                        Merry Christmas
                    </h1>
                </div>

                {/* 底部点缀 */}
                <div className="mt-[-1rem] md:mt-[-2rem] flex flex-col items-center">
                   <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-40 mb-2" />
                   <span className="font-luxury text-[8px] md:text-[10px] tracking-[1.2em] text-white/40 uppercase italic">
                       Season 2025
                   </span>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [targetMix, setTargetMix] = useState(1); 
  const [colors] = useState<TreeColors>({ bottom: '#022b1c', top: '#217a46' });
  const inputRef = useRef({ x: 0, y: 0, isDetected: false });
  
  const [userImages, setUserImages] = useState<string[]>([]);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        let loadedSignatures: string[] = [];
        try {
          const response = await fetch('拍立得签名.txt');
          if (response.ok) {
            const text = await response.text();
            loadedSignatures = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          }
        } catch (e) {}
        setSignatures(loadedSignatures.length >= 5 ? loadedSignatures : ["圣诞快乐", "爱在人间", "Memory 2025", "祝平安"]);
        setUserImages(Array.from({ length: 12 }, (_, i) => `images/${i + 1}.jpg`));
      } catch (err) {
      } finally {
        setTimeout(() => setIsProcessing(false), 2000);
      }
    };
    loadAssets();

    const fsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fsChange);
    return () => document.removeEventListener('fullscreenchange', fsChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setTargetMix(prev => (prev === 1 ? 0 : 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGesture = useCallback((data: HandGesture) => {
    if (data.isDetected) {
        setTargetMix(data.isOpen ? 0 : 1);
        inputRef.current = { x: data.position.x * 1.2, y: data.position.y, isDetected: true };
    } else {
        inputRef.current.isDetected = false;
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
  };

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
  };

  const iconButtonClass = `
    group relative w-10 h-10 md:w-12 md:h-12 rounded-full 
    bg-white/5 backdrop-blur-2xl border border-white/10 text-slate-400 
    transition-all duration-500 ease-out hover:border-white/30 hover:text-white 
    hover:bg-white/10 active:scale-90 flex justify-center items-center cursor-pointer
  `;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      <BackgroundSlideshow images={userImages} />

      {isProcessing && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-all duration-1000">
              <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-t-2 border-[#d4af37] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#d4af37] text-xl animate-pulse">✦</div>
              </div>
              <div className="text-[#d4af37]/60 font-luxury tracking-[0.4em] text-[10px] uppercase">
                Preparing Holiday Magic
              </div>
          </div>
      )}

      <CinematicHeader />

      <div className="absolute inset-0 z-20">
        <Experience 
            mixFactor={targetMix}
            colors={colors} 
            inputRef={inputRef} 
            userImages={userImages}
            allSignatures={signatures}
        />
      </div>

      <div className="absolute bottom-10 w-full flex justify-center z-30 pointer-events-none opacity-40">
          <div className="px-6 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white/60 font-luxury text-[9px] tracking-[0.4em] uppercase">
              {isCameraActive ? 'Sense Active' : 'Space to Explore'}
          </div>
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-40 flex flex-row md:flex-col items-center gap-4">
          <button onClick={toggleFullscreen} className={iconButtonClass}>
            {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
            )}
          </button>
          
          <button onClick={toggleCamera} className={`${iconButtonClass} ${isCameraActive ? 'text-[#d4af37] border-[#d4af37]/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
          </button>
      </div>

      {isCameraActive && (
          <GestureController onGesture={handleGesture} isGuiVisible={isCameraActive} />
      )}
    </div>
  );
};

export default App;
