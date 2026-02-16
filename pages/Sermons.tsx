
import React, { useState } from 'react';
import { Sermon } from '../types';
import { Play, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SermonsProps {
  sermons: Sermon[];
}

const Sermons: React.FC<SermonsProps> = ({ sermons }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVideo, setActiveVideo] = useState<Sermon | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSermons.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSermons = filteredSermons.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 유튜브 URL에 필요한 보안 파라미터 추가
  const getSecureVideoUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    const origin = window.location.origin;
    return `${url}${separator}autoplay=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Page Header */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-white mb-6">예배 및 설교</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">언제 어디서나 하나님의 말씀을 통해 영적인 성숙과 평안을 누리십시오.</p>
        </div>
      </section>

      {/* Video Player Modal/Section */}
      {activeVideo && (
        <section className="bg-slate-100 py-12 border-b border-slate-200 animate-in slide-in-from-top duration-500">
          <div className="max-w-5xl mx-auto px-4">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black mb-8">
               <iframe 
                src={getSecureVideoUrl(activeVideo.videoUrl)} 
                className="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={activeVideo.title}
                referrerPolicy="strict-origin-when-cross-origin"
               ></iframe>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeVideo.title}</h3>
                <p className="text-slate-500">{activeVideo.date} | {activeVideo.speaker} | {activeVideo.scripture}</p>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="mt-4 md:mt-0 px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded-full text-sm font-bold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
        <div className="flex justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="찾으시는 설교 제목 또는 강사명을 검색해 보세요..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </section>

      {/* Sermon List Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentSermons.map((sermon) => (
            <div 
              key={sermon.id} 
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col sm:flex-row"
              onClick={() => {
                setActiveVideo(sermon);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
            >
              <div className="sm:w-2/5 aspect-video relative overflow-hidden bg-slate-200">
                <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="text-primary ml-1" size={20} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">{sermon.date}</span>
                <h4 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{sermon.title}</h4>
                <div className="flex justify-between items-center text-sm text-slate-500 mt-auto">
                  <span>{sermon.speaker}</span>
                  <span className="italic opacity-60 text-xs">{sermon.scripture}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSermons.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            검색 결과가 없습니다. 다른 검색어를 입력해 보세요.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${currentPage === 1 ? 'text-slate-200 border-slate-100' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentPage === i + 1 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${currentPage === totalPages ? 'text-slate-200 border-slate-100' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Sermons;