
import React, { useState } from 'react';
import { News } from '../types';
import { ChevronLeft, ChevronRight, Pin } from 'lucide-react';

interface CommunityProps {
  news: News[];
}

const Community: React.FC<CommunityProps> = ({ news }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 정렬 로직: 상단 고정(is_pinned) 우선, 그 다음 날짜 내림차순
  const sortedNews = [...news].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = sortedNews.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      <section className="bg-slate-900 py-16 md:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 md:mb-6">교제와 소식</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">산전온누리 공동체의 생생한 사역 현장과 소식을 전해드립니다.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
        <div className="space-y-6 md:space-y-8">
          {currentNews.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl md:rounded-3xl border ${item.is_pinned ? 'border-primary/30 bg-primary/[0.02]' : 'border-slate-100'} overflow-hidden shadow-sm flex flex-col sm:flex-row transition-all hover:shadow-md`}
            >
              {item.image && (
                <div className="sm:w-1/4 aspect-[16/9] sm:aspect-square overflow-hidden bg-slate-100">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className={`p-6 md:p-8 ${item.image ? 'sm:w-3/4' : 'w-full'} flex flex-col justify-center`}>
                <div className="flex items-center text-xs font-bold mb-3">
                  {item.is_pinned && (
                    <span className="flex items-center text-primary mr-3 bg-primary/10 px-2 py-0.5 rounded">
                      <Pin size={12} className="mr-1" /> 필독
                    </span>
                  )}
                  <span className="text-slate-400">{item.date}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line line-clamp-3">
                  {item.content}
                </p>
              </div>
            </div>
          ))}

          {news.length === 0 && (
            <div className="text-center py-24 text-slate-400">
              등록된 소식이 없습니다.
            </div>
          )}
        </div>

        {/* 페이징 UI (설교 섹션과 동일한 디자인) */}
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

export default Community;
