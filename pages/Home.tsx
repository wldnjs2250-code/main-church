
import React, { useState } from 'react';
import { ChurchInfo, Sermon, News, Page } from '../types';
import { Play, ArrowLeft, ArrowRight, Calendar, Info, MapPin, Pin } from 'lucide-react';

interface HomeProps {
  churchInfo: ChurchInfo;
  latestSermon: Sermon;
  recentNews: News[];
  onNavigate: (page: Page) => void;
  allSermons: Sermon[];
}

const Home: React.FC<HomeProps> = ({ churchInfo, allSermons, recentNews, onNavigate }) => {
  const [sermonIdx, setSermonIdx] = useState(0);
  const [newsIdx, setNewsIdx] = useState(0);
  const [isPlayingSermon, setIsPlayingSermon] = useState(false);

  // 최신 설교 최대 3개
  const topSermons = allSermons.slice(0, 3);
  const currentSermon = topSermons[sermonIdx] || allSermons[0];

  // 최신 소식 최대 3개 (핀 우선순위는 DB에서 이미 정렬되어 오므로 slice만 수행)
  const topNews = recentNews.slice(0, 3);
  const currentNews = topNews[newsIdx];

  const getSecureVideoUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  };

  const nextSermon = () => {
    setIsPlayingSermon(false);
    setSermonIdx((prev) => (prev + 1) % topSermons.length);
  };
  const prevSermon = () => {
    setIsPlayingSermon(false);
    setSermonIdx((prev) => (prev - 1 + topSermons.length) % topSermons.length);
  };

  const nextNews = () => setNewsIdx((prev) => (prev + 1) % topNews.length);
  const prevNews = () => setNewsIdx((prev) => (prev - 1 + topNews.length) % topNews.length);

  return (
    <div className="animate-in fade-in duration-700 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[75vh] flex items-center justify-center bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1544427928-144944974d91?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover mix-blend-luminosity" alt="Background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/80"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <h1 className="text-[32px] md:text-[80px] font-black text-white leading-tight mb-4 md:mb-6 tracking-[0.1em] md:tracking-[0.2em] drop-shadow-2xl">{churchInfo.name}</h1>
          <p className="text-[14px] md:text-[24px] text-white/60 font-light tracking-[0.1em] md:tracking-[0.2em] uppercase leading-relaxed">{churchInfo.vision}</p>
        </div>
      </section>

      {/* Navigation Cards (Mobile Optimized) */}
      <section className="py-6 md:py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 -mt-10 md:-mt-20">
            <div onClick={() => onNavigate(Page.About)} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between cursor-pointer group hover:-translate-y-1 transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-primary transition-colors"><Info size={20} /></div>
                <span className="ml-4 text-[18px] font-bold text-slate-800">교회 소개</span>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary" />
            </div>
            <div onClick={() => onNavigate(Page.Sermons)} className="bg-primary p-6 md:p-8 rounded-2xl shadow-xl text-white flex items-center justify-between cursor-pointer hover:-translate-y-1 transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-white/20"><Calendar size={20} /></div>
                <div className="ml-4 text-left">
                  <span className="block text-[18px] font-bold">예배 안내</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/60" />
            </div>
            <div onClick={() => onNavigate(Page.Location)} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between cursor-pointer group hover:-translate-y-1 transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-colors"><MapPin size={20} /></div>
                <span className="ml-4 text-[18px] font-bold text-slate-800">오시는 길</span>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Slider Section (Max 3) */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <h2 className="text-[24px] md:text-[48px] font-black">최신 설교 영상</h2>
            {topSermons.length > 1 && (
              <div className="flex space-x-2">
                <button onClick={prevSermon} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowLeft size={16} /></button>
                <button onClick={nextSermon} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowRight size={16} /></button>
              </div>
            )}
          </div>
          <div className="bg-slate-50 rounded-[32px] md:rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-sm animate-in slide-in-from-right-4 duration-500">
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
                <span className="text-primary font-black text-[12px] md:text-[14px] uppercase mb-3">{currentSermon.date}</span>
                <h3 className="text-[20px] md:text-[24px] font-black mb-4 line-clamp-2">{currentSermon.title}</h3>
                <p className="text-slate-600 mb-6 text-[14px]">{currentSermon.speaker} | {currentSermon.scripture}</p>
                <button onClick={() => onNavigate(Page.Sermons)} className="text-primary font-black flex items-center border-b-2 border-primary/20 hover:border-primary transition-all w-fit text-[14px]">전체 설교 보기 <ArrowRight className="ml-2" size={14} /></button>
              </div>
          </div>
        </div>
      </section>

      {/* News Slider Section (Max 3, Pin Priority) */}
      <section className="py-12 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-[24px] md:text-[36px] font-black">교회 소식</h2>
            {topNews.length > 1 && (
              <div className="flex space-x-2">
                <button onClick={prevNews} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"><ArrowLeft size={20} /></button>
                <button onClick={nextNews} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"><ArrowRight size={20} /></button>
              </div>
            )}
          </div>
          
          {currentNews ? (
            <div onClick={() => onNavigate(Page.Community)} className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center gap-8 cursor-pointer hover:shadow-md transition-all border border-slate-100">
              {currentNews.image && (
                <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                  <img src={currentNews.image} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center mb-4">
                  {currentNews.is_pinned && <Pin size={16} className="text-primary mr-2" fill="currentColor" />}
                  <span className="text-slate-400 font-bold text-[14px] uppercase tracking-wider">{currentNews.date}</span>
                </div>
                <h3 className="text-[20px] md:text-[30px] font-black mb-4 line-clamp-1">{currentNews.title}</h3>
                <p className="text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 text-[16px]">{currentNews.content}</p>
                <div className="inline-flex items-center text-primary font-black group">자세히 보기 <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} /></div>
              </div>
            </div>
          ) : (
             <div className="text-center py-20 text-slate-400 font-bold">등록된 소식이 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
