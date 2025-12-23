
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Experience from './components/Experience';
import GestureController from './components/GestureController';
import { TreeColors, HandGesture } from './types';

// --- 升级：极光流光背景组件 ---
const BackgroundSlideshow: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000); 
    return () => clearInterval(timer);
  }, [images]);

  const displayImages = images.length > 0 ? images : ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjW5znJAxObrFwoHzdYpALR8BAkbclERGBGA&s"];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* 第一层：深邃径向基底 */}
      <div className="absolute inset-0" style={{ 
        background: 'radial-gradient(circle at 50% 50%, #03150d 0%, #010a05 40%, #000000 100%)' 
      }} />
      
      {/* 第二层：多色氛围光晕 */}
      <div className="absolute inset-0 opacity-20 mix-blend-screen overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] animate-slow-spin blur-[140px]" style={{
              background: 'conic-gradient(from 180deg at 50% 50%, #051a10, #1a1a2e, #0a0501, #051a10)'
          }} />
      </div>

      {/* 第三层：图片色彩提取层 */}
      {displayImages.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[4000ms] ease-in-out"
          style={{
            opacity: i === index ? 0.25 : 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(120px) saturate(2) brightness(0.4) contrast(1.2)',
            transform: i === index ? 'scale(1.3) rotate(2deg)' : 'scale(1.1) rotate(0deg)',
          }}
        />
      ))}

      {/* 第四层：高级胶片杂色纹理 */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* 遮罩：电影级暗角 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />

      <style>{`
        @keyframes slow-spin {
            from { transform: rotate(0deg) scale(1); }
            to { transform: rotate(360deg) scale(1.1); }
        }
        .animate-slow-spin {
            animation: slow-spin 35s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- 升级：灵动奢侈品级标题组件 ---
const CinematicHeader: React.FC = () => {
    return (
        <div className="absolute top-[6%] left-0 w-full flex flex-col items-center justify-center pointer-events-none z-10 space-y-[-1.5rem] md:space-y-[-3rem]">
            {/* 顶层仪式感文字 */}
            <div className="flex items-center gap-4 opacity-70 mb-2">
                <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
                <span className="font-luxury text-[10px] md:text-[12px] tracking-[0.6em] text-[#d4af37] uppercase">
                    The Grand Gift of Memory
                </span>
                <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
            </div>

            {/* 主标题容器 */}
            <div className="relative group">
                {/* 底层模糊辉光 */}
                <h1 className="font-script text-7xl md:text-[10rem] text-[#d4af37]/20 blur-xl absolute inset-0 select-none">
                    Merry Christmas
                </h1>
                
                {/* 灵动主文字 */}
                <h1 
                    className="relative font-script text-7xl md:text-[10rem] text-center px-4 leading-none"
                    style={{
                        background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0px 15px 30px rgba(0,0,0,0.6))'
                    }}
                >
                    <span className="inline-block hover:scale-105 transition-transform duration-700">Merry</span>
                    <span className="block md:inline md:ml-8 hover:scale-105 transition-transform duration-700 delay-75">Christmas</span>
                </h1>

                {/* 动态扫光层 */}
                <h1 className="font-script text-7xl md:text-[10rem] text-center absolute inset-0 text-shimmer select-none pointer-events-none">
                    Merry Christmas
                </h1>
            </div>

            {/* 年份标识 */}
            <div className="pt-4 md:pt-8 opacity-40">
                <span className="font-luxury text-[8px] md:text-[10px] tracking-[1em] text-white uppercase italic">
                    Est. 2025
                </span>
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
        setSignatures(loadedSignatures.length >= 5 ? loadedSignatures : [...loadedSignatures, "圣诞快乐", "爱在人间", "Memory 2025", "祝平安"]);
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
    setIsCameraActive(prev => {
        const newState = !prev;
        if (!newState) inputRef.current.isDetected = false;
        return newState;
    });
  };

  const iconButtonClass = `
    group relative w-10 h-10 md:w-12 md:h-12 rounded-full 
    bg-white/5 backdrop-blur-2xl border border-white/10 text-slate-400 
    transition-all duration-500 ease-out hover:border-white/30 hover:text-white 
    hover:bg-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] 
    active:scale-90 flex justify-center items-center cursor-pointer
  `;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      <BackgroundSlideshow images={userImages} />

      {isProcessing && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-all duration-1000">
              <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 border-2 border-t-[#d4af37] border-r-transparent border-b-[#d4af37] border-l-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#d4af37] text-2xl animate-pulse">✦</div>
              </div>
              <div className="text-[#d4af37]/80 font-luxury tracking-[0.4em] text-[10px] uppercase animate-pulse text-center">
                  Rendering Cinematic Memory...
              </div>
          </div>
      )}

      {/* 优化后的顶部标题 */}
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

      <div className="absolute bottom-12 w-full flex justify-center z-30 pointer-events-none opacity-40">
          <div className="px-8 py-2 rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white/50 font-luxury text-[9px] tracking-[0.3em] uppercase">
              {isCameraActive ? 'Gesture Active' : 'Space Key to Explore'}
          </div>
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-40 flex flex-row md:flex-col items-center gap-4">
          <button onClick={toggleFullscreen} className={iconButtonClass} title="Toggle Fullscreen">
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
          
          <button onClick={toggleCamera} className={`${iconButtonClass} ${isCameraActive ? 'text-[#d4af37] border-[#d4af37]/40 bg-white/5' : 'text-slate-500 opacity-60'}`} title="Camera Toggle">
              {isCameraActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c.273 0 .506.217.535.49a.485.485 0 01-.535.51H3.82c-.328 0-.573-.284-.507-.605l.962-4.702a4.49 4.49 0 011.067-2.247l.544-.567c.13-.135.32-.175.493-.103a47.92 47.92 0 014.612 2.098c.116.06.19.183.19.314V14.75c0 .414.336.75.75.75h1.75a.75.75 0 01.75.75v1.25zM1.836 12.037a.447.447 0 00-.547.622 2.451 2.451 0 00.522.582l3.293 2.709c.226.186.55.154.737-.074a.453.453 0 00-.038-.642L1.836 12.037zM9 9a3 3 0 100-6 3 3 0 000 6zm5.274-1.318l1.316-2.106a1.192 1.192 0 011.513-.473 48.08 48.08 0 012.987 1.266c.249.125.37.42.274.674l-1.107 2.905a2.19 2.19 0 01-1.037 1.153l-3.946 1.728z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
          </button>
      </div>

      <div className="absolute bottom-8 left-8 z-30 opacity-30 hover:opacity-100 transition-opacity">
            <div className="text-white text-[9px] uppercase tracking-[0.4em] font-luxury flex items-center gap-3">
                <span>Memory Christmas Tree</span>
                <span className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Season 2025</span>
            </div>
      </div>

      {isCameraActive && (
          <GestureController onGesture={handleGesture} isGuiVisible={isCameraActive} />
      )}
    </div>
  );
};

export default App;
