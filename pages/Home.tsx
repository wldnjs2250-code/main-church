
import React, { useState } from 'react';
import { ChurchInfo, Sermon, News, Page } from '../types';
import { Play, ArrowRight, Calendar, Info, MapPin } from 'lucide-react';

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

  const getSecureVideoUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <div className="animate-in fade-in duration-700 overflow-x-hidden">
      <section className="relative h-[50vh] md:h-[75vh] flex items-center justify-center bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1544427928-144944974d91?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover mix-blend-luminosity" alt="Background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/80"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <h1 className="text-3xl md:text-8xl font-black text-white leading-tight mb-4 md:mb-6 tracking-[0.1em] md:tracking-[0.2em] drop-shadow-2xl">{churchInfo.name}</h1>
          <p className="text-sm md:text-2xl text-white/60 font-light tracking-[0.1em] md:tracking-[0.2em] uppercase leading-relaxed">{churchInfo.vision}</p>
        </div>
      </section>

      <section className="py-6 md:py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 -mt-10 md:-mt-20">
            <div onClick={() => onNavigate(Page.About)} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[32px] shadow-xl border border-slate-100 flex items-center justify-between cursor-pointer group hover:-translate-y-1 transition-all">
              <div className="flex items-center">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 group-hover:text-primary transition-colors"><Info size={20} /></div>
                <span className="ml-4 md:ml-5 text-lg md:text-xl font-bold text-slate-800">교회 소개</span>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary" />
            </div>
            <div onClick={() => onNavigate(Page.Sermons)} className="bg-primary p-6 md:p-10 rounded-2xl md:rounded-[32px] shadow-xl text-white flex items-center justify-between cursor-pointer hover:-translate-y-1 transition-all">
              <div className="flex items-center">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20"><Calendar size={20} /></div>
                <div className="ml-4 md:ml-5 text-left">
                  <span className="block text-lg md:text-xl font-bold">예배 안내</span>
                  <span className="text-white/70 text-xs hidden md:block">거룩한 예배의 자리</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/60" />
            </div>
            <div onClick={() => onNavigate(Page.Location)} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[32px] shadow-xl border border-slate-100 flex items-center justify-between cursor-pointer group hover:-translate-y-1 transition-all">
              <div className="flex items-center">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-colors"><MapPin size={20} /></div>
                <span className="ml-4 md:ml-5 text-lg md:text-xl font-bold text-slate-800">오시는 길</span>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <h2 className="text-2xl md:text-5xl font-black mb-8 md:mb-12">최신 설교 영상</h2>
           <div className="bg-slate-50 rounded-3xl md:rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-sm">
             <div className="lg:w-2/3 aspect-video bg-black relative">
               {isPlayingSermon ? (
                 <iframe src={getSecureVideoUrl(currentSermon.videoUrl)} className="w-full h-full" allowFullScreen></iframe>
               ) : (
                 <div className="w-full h-full cursor-pointer" onClick={() => setIsPlayingSermon(true)}>
                   <img src={currentSermon.thumbnail} className="w-full h-full object-cover" alt="Sermon" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all">
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl"><Play className="text-primary ml-1" fill="currentColor" /></div>
                   </div>
                 </div>
               )}
             </div>
             <div className="lg:w-1/3 p-8 md:p-12 text-left flex flex-col justify-center">
               <span className="text-primary font-black text-xs md:text-sm uppercase mb-3 md:mb-4">{currentSermon.date}</span>
               <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6">{currentSermon.title}</h3>
               <p className="text-slate-600 mb-6 md:mb-8 text-sm md:text-base">{currentSermon.speaker} | {currentSermon.scripture}</p>
               <button onClick={() => onNavigate(Page.Sermons)} className="text-primary font-black flex items-center border-b-2 border-primary/20 hover:border-primary transition-all w-fit text-sm md:text-base">전체 설교 보기 <ArrowRight className="ml-2" size={14} /></button>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
