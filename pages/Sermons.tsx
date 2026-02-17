
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

  const totalPages = Math.ceil(filteredSermons.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSermons = filteredSermons.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const block = Math.floor((currentPage - 1) / 10);
  const startPage = block * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  const getSecureVideoUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      <section className="bg-slate-900 py-24 text-center text-white">
        <h2 className="text-4xl font-extrabold mb-6">예배 및 설교</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">언제 어디서나 하나님의 말씀을 통해 영적인 성숙과 평안을 누리십시오.</p>
      </section>

      {activeVideo && (
        <section className="bg-slate-100 py-12 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black mb-8">
               <iframe src={getSecureVideoUrl(activeVideo.videoUrl)} className="w-full h-full" allowFullScreen></iframe>
            </div>
            <div className="flex justify-between items-center">
              <div><h3 className="text-2xl font-bold text-slate-900 mb-2">{activeVideo.title}</h3><p className="text-slate-500">{activeVideo.date} | {activeVideo.speaker}</p></div>
              <button onClick={() => setActiveVideo(null)} className="px-6 py-2 bg-slate-200 rounded-full text-sm font-bold">닫기</button>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 mt-12 mb-12 flex justify-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="검색..." className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentSermons.map((sermon) => (
            <div key={sermon.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row" onClick={() => {setActiveVideo(sermon); window.scrollTo({ top: 400, behavior: 'smooth' });}}>
              <div className="sm:w-2/5 aspect-video relative"><img src={sermon.thumbnail} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/10 flex items-center justify-center"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><Play className="text-primary ml-1" size={20} fill="currentColor" /></div></div></div>
              <div className="p-6 sm:w-3/5"><span className="text-xs font-bold text-primary mb-2 block">{sermon.date}</span><h4 className="text-lg font-bold mb-3 line-clamp-2">{sermon.title}</h4><div className="flex justify-between text-sm text-slate-500"><span>{sermon.speaker}</span><span className="italic opacity-60 text-xs">{sermon.scripture}</span></div></div>
            </div>
          ))}
        </div>

        {/* 숫자 페이징 개편 */}
        <div className="mt-16 flex justify-center items-center space-x-2 md:space-x-4 text-slate-400 font-bold">
          <button 
            disabled={block === 0} 
            onClick={() => handlePageChange(Math.max(1, startPage - 10))} 
            className="p-2 transition-colors hover:text-primary disabled:opacity-0"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center">
            <span className="mx-1 md:mx-2">-</span>
            {pages.map((p, idx) => (
              <React.Fragment key={p}>
                <button 
                  onClick={() => handlePageChange(p)} 
                  className={`px-1 md:px-2 transition-all ${currentPage === p ? 'text-primary scale-110 font-black' : 'hover:text-slate-600'}`}
                >
                  {p}
                </button>
                {idx < pages.length - 1 && <span className="mx-0.5 md:mx-1">,</span>}
              </React.Fragment>
            ))}
            <span className="mx-1 md:mx-2">-</span>
          </div>

          <button 
            disabled={endPage === totalPages} 
            onClick={() => handlePageChange(Math.min(totalPages, endPage + 1))} 
            className="p-2 transition-colors hover:text-primary disabled:opacity-0"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Sermons;
