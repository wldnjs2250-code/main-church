
import React, { useState } from 'react';
import { News } from '../types';
import { ChevronLeft, ChevronRight, Pin } from 'lucide-react';

interface CommunityProps {
  news: News[];
}

const Community: React.FC<CommunityProps> = ({ news }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedNews = [...news].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = sortedNews.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const block = Math.floor((currentPage - 1) / 10);
  const startPage = block * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      <section className="bg-slate-900 py-16 md:py-24 text-center text-white">
        <h2 className="text-[28px] md:text-[40px] font-extrabold mb-4">교제와 소식</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-[14px] md:text-[16px]">산전온누리 공동체의 생생한 사역 현장과 소식을 전해드립니다.</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 mt-12 md:mt-16 space-y-6 md:space-y-8">
        {currentNews.map((item) => (
          <div key={item.id} className={`bg-white rounded-3xl border ${item.is_pinned ? 'border-primary/30 bg-primary/[0.02]' : 'border-slate-100'} overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition-all`}>
            {item.image && <div className="sm:w-1/4 aspect-[16/9] sm:aspect-square overflow-hidden bg-slate-100"><img src={item.image} alt="" className="w-full h-full object-cover" /></div>}
            <div className={`p-6 md:p-8 ${item.image ? 'sm:w-3/4' : 'w-full'} flex flex-col justify-center`}>
              <div className="flex items-center text-[12px] font-bold mb-3">{item.is_pinned && <span className="flex items-center text-primary mr-3 bg-primary/10 px-2 py-0.5 rounded"><Pin size={12} className="mr-1" /> 필독</span>}<span className="text-slate-400">{item.date}</span></div>
              <h3 className="text-[20px] md:text-[24px] font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed text-[14px] line-clamp-3">{item.content}</p>
            </div>
          </div>
        ))}

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

export default Community;
