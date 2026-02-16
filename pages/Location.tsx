
import React from 'react';
import { ChurchInfo } from '../types';
import { MapPin, Phone, Clock } from 'lucide-react';

interface LocationProps {
  churchInfo: ChurchInfo;
}

const Location: React.FC<LocationProps> = ({ churchInfo }) => {
  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Updated Header Section to Navy Theme */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">오시는 길</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">산전온누리교회는 언제나 당신의 방문을 기다립니다.</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-10">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">주소</h4>
                      <p className="text-slate-600">도로명: 울산광역시 중구 산전길 103</p>
                      <p className="text-slate-400 text-sm italic">지번: 울산광역시 중구 동동 162-4</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">전화</h4>
                      <p className="text-slate-600">{churchInfo.phone}</p>
                    </div>
                  </div>
               </div>

               <div className="bg-slate-900 text-white p-10 rounded-3xl space-y-8">
                  <div className="flex items-center">
                    <Clock className="text-primary mr-4" size={24} />
                    <h4 className="text-xl font-bold">교회 안내</h4>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-bold text-slate-400 mb-2 uppercase text-xs tracking-widest">위치 설명</h5>
                      <p className="text-slate-300">울산 중구 동동 산전마을 입구 부근에 위치하고 있습니다.</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-400 mb-2 uppercase text-xs tracking-widest">주차 안내</h5>
                      <p className="text-slate-300">교회 전용 주차장 및 인근 공영주차장 이용이 가능합니다.</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-200 rounded-3xl overflow-hidden min-h-[500px] relative group border border-slate-100">
              <iframe 
                src="https://maps.google.com/maps?q=울산%20중구%20산전길%20103&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" 
                allowFullScreen={true} 
                loading="lazy"
              ></iframe>
              <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-full shadow-lg pointer-events-none font-bold text-sm text-slate-900 border border-slate-100">
                산전온누리교회 위치
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Location;
