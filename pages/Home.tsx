
import React, { useState } from 'react';
import { ChurchInfo, Sermon, News, Page } from '../types.ts';
import { Play, ArrowRight, Calendar, Info, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeProps {
  churchInfo: ChurchInfo;
  latestSermon: Sermon;
  recentNews: News[];
  onNavigate: (page: Page) => void;
  allSermons: Sermon[];
}

const Home: React.FC<HomeProps> = ({ churchInfo, allSermons, recentNews, onNavigate }) => {
  const [currentSermonIndex, setCurrentSermonIndex] = useState(0);
  const [isPlayingSermon, setIsPlayingSermon] = useState(false);

  const sliderSermons = allSermons.slice(0, 5);
  const currentSermon = sliderSermons[currentSermonIndex] || allSermons[0];

  const handlePrev = () => {
    setIsPlayingSermon(false);
    setCurrentSermonIndex((prev) => (prev === 0 ? sliderSermons.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlayingSermon(false);
    setCurrentSermonIndex((prev) => (prev === sliderSermons.length - 1 ? 0 : prev + 1));
  };

  const getSecureVideoUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    const origin = window.location.origin;
    return `${url}${separator}autoplay=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  };

  return (
    <div className="animate-in fade-in duration-700 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1544427928-144944974d91?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover mix-blend-luminosity"
            alt="Spiritual Cross Background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/80"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="w-8 md:w-12 h-[1px] bg-white/30 mx-auto mb-8 md:mb-12"></div>
          <h1 className="text-4xl md:text-8xl font-black text-white leading-tight mb-6 md:mb-10 tracking-[0.2em] drop-shadow-2xl break-keep">
            {churchInfo.name}
          </h1>
          <p className="text-base md:text-2xl text-white/60 font-light tracking-[0.2em] md:tracking-[0.3em] uppercase leading-relaxed break-keep">
            {churchInfo.vision}
          </p>
          <div className="w-8 md:w-12 h-[1px] bg-white/30 mx-auto mt-8 md:mt-12"></div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 md:py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 -mt-12 md:-mt-20">
            <div 
              onClick={() => { window.location.hash = Page.About; }}
              className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl md:shadow-2xl shadow-slate-200/60 border border-slate-100 flex items-center justify-between cursor-pointer group hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Info size={24} className="md:w-7 md:h-7" />
                </div>
                <span className="ml-4 md:ml-5 text-lg md:text-xl font-bold text-slate-800">교회 소개</span>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>

            <div 
              onClick={() => { window.location.hash = Page.Sermons; }}
              className="bg-primary p-6 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl md:shadow-2xl shadow-primary/20 text-white flex items-center justify-between cursor-pointer transform hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20">
                  <Calendar size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="ml-4 md:ml-5 text-left">
                  <span className="block text-lg md:text-xl font-bold">예배 안내</span>
                  <span className="text-white/70 text-xs md:text-sm font-medium">거룩한 예배의 자리</span>
                </div>
              </div>
              <ArrowRight size={18} className="text-white/60" />
            </div>

            <div 
              onClick={() => { window.location.hash = Page.Location; }}
              className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl md:shadow-2xl shadow-slate-200/60 border border-slate-100 flex items-center justify-between cursor-pointer group hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <MapPin size={24} className="md:w-7 md:h-7" />
                </div>
                <span className="ml-4 md:ml-5 text-lg md:text-xl font-bold text-slate-800">오시는 길</span>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Sermon Slider */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10 md:mb-16 flex-col md:flex-row gap-6">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">최신 설교 영상</h2>
            <div className="flex space-x-3">
              <button onClick={handlePrev} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all bg-white shadow-sm">
                <ChevronLeft size={24} />
              </button>
              <button onClick={handleNext} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all bg-white shadow-sm">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[32px] md:rounded-[48px] overflow-hidden border border-slate-100 flex flex-col lg:flex-row min-h-[400px] md:min-h-[500px] shadow-sm">
            <div className="lg:w-2/3 aspect-video relative group bg-black">
              {isPlayingSermon ? (
                <div className="w-full h-full relative">
                  <iframe 
                    src={getSecureVideoUrl(currentSermon.videoUrl)} 
                    className="w-full h-full" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    title={currentSermon.title}
                    referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                  <button onClick={() => setIsPlayingSermon(false)} className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/20 hover:bg-white/40 p-2 md:p-3 rounded-full text-white backdrop-blur-xl transition-all">
                    <X size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full cursor-pointer animate-in fade-in duration-500" onClick={() => setIsPlayingSermon(true)}>
                  <img src={currentSermon.thumbnail} className="w-full h-full object-cover opacity-90" alt="Sermon" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all flex items-center justify-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all">
                      <Play className="text-primary ml-1 w-8 h-8 md:w-9 md:h-9" fill="currentColor" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:w-1/3 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-left">
              <span className="text-primary font-black text-xs md:text-sm tracking-widest uppercase mb-3 md:mb-4">{currentSermon.date}</span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 md:mb-6 leading-tight line-clamp-2">{currentSermon.title}</h3>
              <div className="space-y-1 md:space-y-2 mb-8 md:mb-12">
                <p className="text-slate-600 font-bold text-base md:text-lg">{currentSermon.speaker}</p>
                <p className="text-slate-400 italic font-medium text-sm md:text-base">{currentSermon.scripture}</p>
              </div>
              <button 
                onClick={() => { window.location.hash = Page.Sermons; }}
                className="w-fit text-primary font-black flex items-center border-b-2 border-primary/20 pb-1 hover:border-primary transition-all text-sm md:text-base"
              >
                전체 설교 더보기 <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">교회 소식</h2>
            <button 
              onClick={() => { window.location.hash = Page.Community; }}
              className="hidden md:flex items-center text-slate-400 font-bold hover:text-primary transition-colors"
            >
              더보기 <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {recentNews.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-[24px] md:rounded-[32px] mb-6 md:mb-8 aspect-[4/3] shadow-md border border-slate-100">
                  <img 
                    src={item.image || `https://picsum.photos/seed/${item.id}/600/400`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={item.title} 
                  />
                </div>
                <div className="space-y-2 md:space-y-3 px-2">
                  <span className="text-slate-400 text-xs md:text-sm font-bold tracking-wider">{item.date}</span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                  <p className="text-slate-500 line-clamp-2 leading-relaxed font-medium text-sm md:text-base">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 md:hidden">
            <button 
              onClick={() => { window.location.hash = Page.Community; }}
              className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl border border-slate-100"
            >
              전체 소식 보기
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary overflow-hidden relative rounded-[40px] md:rounded-[60px] mx-4 mb-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl md:text-5xl font-extrabold text-white mb-6 md:mb-8 break-keep">당신을 기다리고 있습니다</h2>
          <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-10 md:mb-12 font-medium break-keep">
            산전온누리교회는 누구에게나 열려 있습니다. <br /> 언제든지 오셔서 하나님의 위로와 평안을 경험하세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => { window.location.hash = Page.Location; }}
              className="px-8 md:px-10 py-4 md:py-5 bg-white text-primary font-bold rounded-xl md:rounded-2xl hover:shadow-2xl transition-all"
            >
              교회 위치 안내
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
