
import React from 'react';
import { News } from '../types';

interface CommunityProps {
  news: News[];
}

const Community: React.FC<CommunityProps> = ({ news }) => {
  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Updated Header Section to Navy Theme */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">교제와 소식</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">산전온누리 공동체의 생생한 사역 현장을 전해드립니다.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="space-y-12">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col md:flex-row">
              {item.image && (
                <div className="md:w-1/3 aspect-[4/3] md:aspect-square overflow-hidden bg-slate-100">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8 md:p-12 md:w-2/3 flex flex-col justify-center">
                <div className="flex items-center text-sm font-bold text-primary mb-4">
                  <span>NEWS</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="text-slate-400">{item.date}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-line">
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
      </section>
    </div>
  );
};

export default Community;
